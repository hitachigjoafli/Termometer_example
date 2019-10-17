<template>
 <v-container grid-list-md text-xs-center>
 <!-- "HTML"-kod det som syns på sidan. Stor del är gjort med Vuetify med färdiga komponenter. -->
  <v-layout row wrap>
  
      <v-flex xs12>
     
<DataChart  :chartdata="datacollection"  />
          </v-flex>
  </v-layout>
        </v-container>
</template>

<script>
//Bibliotek som ska användas
import Vue from 'vue'
import DataChart from './DataChart'
export default {
  name: 'EnChart',
    components: {
    DataChart
  },
  //VETA MER? Så som options, kika här https://www.sitepoint.com/creating-beautiful-charts-vue-chart-js/
  //Eller här!
  data() {//All data som ska finnas i komponenten
    return {
      CurrentDevice: null,
      Devicedata:null,
 datacollection: {
          //Data to be represented on x-axis
          labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
          datasets: [
            {
              label: 'Data One',
              backgroundColor: '#f87979',
              pointBackgroundColor: 'white',
              borderWidth: 1,
              pointBorderColor: '#249EBF',
              //Data to be represented on y-axis
              data: [40, 20, 30, 50, 90, 10, 20, 40, 50, 70, 90, 100]
            }
          ]
        },

  }
  }
}
</script>

<!-- CSS -->
<style scoped>

</style>
