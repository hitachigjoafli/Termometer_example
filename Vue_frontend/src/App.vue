<template>
  <v-app>
    <v-toolbar app>
      <v-toolbar-title class="headline text-uppercase">
        <span>ABB</span>
        <span class="font-weight-light">IOT</span>
      </v-toolbar-title>
      <v-spacer></v-spacer>

    </v-toolbar>

    <v-content>
    <div v-if="addnew!==true">
    <v-layout row wrap>
         <v-flex xs12>
    <GetDevices Rubrik="Oregisterade enheter" />
     </v-flex>
     <v-divider/>
        <v-flex xs12>
    <GetDevices Regged Rubrik="Registerade enheter" />
     </v-flex>
      </v-layout>
      </div>
          <div v-else>
     
      </div>
    </v-content>
  </v-app>
</template>

<script>
import GetDevices from './components/GetDevices'

export default {
  name: 'App',
  components: {
    GetDevices
  },
  data () {
    return {
      addnew:false,
      //
    }
  }
}
</script>
