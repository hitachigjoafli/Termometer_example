<template>
 <!-- "HTML"-kod det som syns på sidan. Stor del är gjort med Vuetify med färdiga komponenter. -->
<v-layout  justify-center>
   <v-flex xs12>
  <v-btn @click="Show= !Show" id="Cooltext">{{Showtext}}<span class="big">!!</span></v-btn>
  </v-flex>
      <v-layout row v-if="Show">
      <v-flex xs6 order-lg2>
         <v-btn @click="GetAnotherRandomName()">{{name}}</v-btn>
      </v-flex>
      <v-flex xs6>
        <v-btn >{{GetRandomName}}</v-btn>
      </v-flex>
    </v-layout>
  <v-layout column v-if="!Show">
      <v-flex xs2 v-for="(item, index) in names" :key="index">
         <v-btn :color="colors[index]">{{item}}</v-btn>
      </v-flex>
     <v-flex xs12 sm6 md3>
          <v-text-field
            label="Viktigt meddelande"
            box
            v-model="MSG"
          ></v-text-field>
        </v-flex>
    </v-layout>
    
  </v-layout>

</template>

<script>
//Bibliotek som ska användas
const axios = require('axios');

export default {
  name: 'ExampleComp',
   props: {//Data som skickas in i komponenten
    MSG: {
      type: String,
      required: true
    },
  },
  data() {//All data som ska finnas i komponenten
    return {
    Showtext:"Visa",
     name: '',
     Show:false,
      names: [
        'Pelle',
        'Joel',
        'Jonas',
        'Stian',
        'Lars',
        'Göran',
        'Jan',
      ],
         colors: [
        'green',
        'red',
        'blue',
        'amber',
        'pink',
        'yellow',
        'red',
      ],
     
    }
  },
  created() { //När komponenten är skapad
      let date= new Date();
      console.log("Nu är den skapad "+      date.toLocaleTimeString());
  },
  mounted() { //När komponenten är mountad (inladdad)
        let date= new Date();
      console.log("Nu är den mountad "+      date.toLocaleTimeString());
  },
  computed: {  
      GetRandomName(){
          var max=this.names.length;  
          return this.names[this.Random(0,max)];
      }
  },
  methods: { //Metoder
    GetAnotherRandomName(){
          var max=this.names.length;  
          this.name= this.names[this.Random(0,max)];
    } ,
      Random(min,max){
          var random =Math.floor(Math.random() * (+max - +min)) + +min; 
          return random;
    } ,
    }

}
</script>

<!-- CSS -->
<style scoped>
.big{
font-size: 25px;
}
#Cooltext{
    color:black;
    text-decoration: underline; 
}
</style>
