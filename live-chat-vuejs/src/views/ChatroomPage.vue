<template>
  <div class="container">
    <NabvarPage />
    <ChatWindow @connectCable="connectCable" :messages="formattedMessages" ref="chatWindow" />
    <NewChatForm @connectCable="connectCable" />
  </div>
</template>

<script>
import NabvarPage from '../components/NabvarPage'
import ChatWindow from '../components/ChatWindow'
import axios from 'axios'
import NewChatForm from '../components/NewChatForm.vue'
import ActionCable from 'actioncable'
import { formatDistanceToNow } from 'date-fns'
import { ja } from 'date-fns/locale'

export default {
  components: { NabvarPage, ChatWindow, NewChatForm },
  data () {
    return {
      messages: [],
    }
  },
  computed: {
    formattedMessages () {
      if (!this.messages.length) { return [] }
      return this.messages.map(message => {
        let time = formatDistanceToNow(new Date(message.created_at), { locale: ja})
        return { ...message, created_at: time }
      })
    }
  },
  methods: {
    async getMessages () {
      try {
        const res = await axios.get('http://localhost:3000/messages', {
          headers: {
            uid: window.localStorage.getItem('uid'),
            "access-token": window.localStorage.getItem('access-token'),
            client: window.localStorage.getItem('client')
          }
        })

        if (!res) {
          new Error('メッセージ一覧を取得できませんでした')
        }
       
       this.messages = res.data
      } catch (err) {
        console.log(err)
      }
    },
    connectCable (message) {
      this.messageChannel.perform('receive', {
        message: message,
        email: window.localStorage.getItem('uid')
      })
    }
  },
   mounted () {
    const cable = ActionCable.createConsumer('ws://localhost:3000/cable')
    this.messageChannel = cable.subscriptions.create('RoomChannel', {
      connected: () => {
        // ======= 👇 ここから変更する ======= 
        this.getMessages().then(() => {
          this.$refs.chatWindow.scrollToBottom()
        })
        // ======= 👆 ここまで変更する =======    
      },
      received: () => {
        // ======= 👇 ここから追加する =======
        this.getMessages().then(() => {
          this.$refs.chatWindow.scrollToBottom()
        })
        // ======= 👆 ここまで追加する =======    
      }
    })
  },
  beforeUnmount () {
    this.messageChannel.unsubscribe()
  }
}
</script>
<style scoped>
</style>