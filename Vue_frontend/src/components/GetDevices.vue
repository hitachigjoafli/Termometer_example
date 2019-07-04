<template>
 <v-container grid-list-md text-xs-center>
 <!-- "HTML"-kod det som syns på sidan. Stor del är gjort med Vuetify med färdiga komponenter. -->
  <v-layout row wrap>
  
      <v-flex xs12>
        <v-card dark color="primary">
          <v-card-title primary-title>  <h3 class="headline mb-0"> {{Rubrik}} [{{Devices.length}}]</h3>  </v-card-title>
        </v-card>
      </v-flex>
 <v-flex xs12>
        <v-card dark color="grey">
                  <v-card-title>  <h4 class=""> MAC adresses</h4>  </v-card-title>
        </v-card>
      </v-flex>

<v-flex d-flex xs12>
    <v-container grid-list-md text-xs-center>
          <v-layout row wrap>
                        <v-flex xs4 v-for="(Device) in Devices" :key="Device.macAddress">
            <v-expansion-panel >
              <v-expansion-panel-content  class="secondary">
                <div slot="header" v-if="Regged==false">{{Device.macAddress}}</div>
                 <div slot="header" v-else> {{Device.name}}  ({{Device.macAddress}})</div>
                <div slot="actions">
                  <v-icon
                    v-if='Device.owner!=""  && Device.name!=""'
                    color="teal"
                  >done</v-icon>
                  <v-icon v-else color="error">error</v-icon>
                </div>
                <v-card>
                  <form>
                    <v-text-field
                      v-model="Device.owner"
                      label="Owner"
                      data-vv-name="Owner"
                      required
                      :disabled="disabled"
                    ></v-text-field>
                    <v-text-field
                      v-model="Device.name"
                      label="Device Name"
                      data-vv-name="Device Name"
                      required
                      :disabled="disabled"
                    ></v-text-field>
                       <v-text-field
                      v-model="Device.updateInterval"
                      label="Time interval"
                       type="number"
                      suffix="Seconds"
                      data-vv-name="Time interval"
                      :disabled="disabled"
                    ></v-text-field>
                     
       <v-btn v-if="Regged" @click="Visa(Device)"   color="red lighten-2"
          dark>
          Visa
        </v-btn>
         <v-btn v-else @click="Regga(Device)">Registrera</v-btn>
                  </form>
                </v-card>
              </v-expansion-panel-content>
                        
            </v-expansion-panel>
            </v-flex >
          </v-layout> 
          
    </v-container>
          </v-flex>
  </v-layout>
<div  class="text-xs-center">
    <v-dialog 
      v-model="popup"
      width="500"
    >
     
          

      <v-card v-if="CurrentDevice!=null">
        <v-card-title
          class="headline grey lighten-2"
          primary-title
        >
        {{CurrentDevice.name}} - {{CurrentDevice.owner}}
        </v-card-title>
 <v-btn
            color="light-blue"
            flat
          >
           Created: {{CurrentDevice.utcTimeCreated}}
          </v-btn>
           <v-btn
            color="light-blue"
            flat
          >
           Registered: {{CurrentDevice.utcTimeRegistered}}
          </v-btn>
           <v-btn
            color="light-blue"
            flat
          >
           UpdateInterval: {{CurrentDevice.updateInterval}}
          </v-btn>
            <v-btn
            color="red"
            @click="remove(CurrentDevice.macAddress)"
          >
         Remove Device
         <v-icon>remove_circle_outline</v-icon>
          </v-btn>

          <div v-if="Devicedata!=null">
<DataChart  :chartdata="Devicedata"  />
               
              <download-excel
    class   = "v-btn green"
    :data   = "json_data"
    :fields = "json_fields"
    worksheet = "My data"
    name    = "Devicedata.xls">
 
    Download Excel
 
</download-excel>
                    <v-btn
            color="red"
            @click="emptydata(CurrentDevice.macAddress)"
          >
         Empty data
         <v-icon>delete_sweep</v-icon>
          </v-btn>
</div>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            flat
            @click="popup = false"
          >
            Stäng
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
        </v-container>
</template>

<script>
//Bibliotek som ska användas
import Vue from 'vue'
import JsonExcel from 'vue-json-excel'
 
Vue.component('downloadExcel', JsonExcel)


import DataChart from './DataChart'
export default {
  name: 'GetDevices',
    components: {
    DataChart
  },
   props: {//Data som skickas in i komponenten
    Regged: {
      type: Boolean
    },
    Rubrik: {
      type: String
    },
  },
  data() {//All data som ska finnas i komponenten
    return {
      CurrentDevice: null,
      Devicedata:null,
    popup:false,
    disabled:false,
  json_fields: { //https://www.npmjs.com/package/vue-json-excel
            'Owner name': 'owner',
            'Device name': 'name',
            'Mac-address': 'macaddress',
            'Created': 'created',
            'Time': 'time',
            'Temperature': 'temperature',
            'Humidity': 'humidity',
           
        },
        json_data: null,
        json_meta: [
            [
                {
                    'key': 'charset',
                    'value': 'utf-8'
                }
            ]
        ],
     
    }
  },
  created() { //När komponenten är skapad
  if(this.Regged == true)
  {
    this.disabled=true;
    this.$store.dispatch("GetreggedDevices");
  }
  else{
    this.$store.dispatch("GetUnreggedDevices");
  }
  },
  mounted() { //När komponenten är mountad (inladdad)
        let date= new Date();
      console.log("Nu är den mountad "+      date.toLocaleTimeString());
  },
  computed: {  
      Devices(){
        
        if(this.Regged == true)
        {
        return this.$store.getters.reggedDevices;
        }
        else{
          let data= this.$store.getters.unreggedDevices;
          data.forEach(device => {
            device.name="";
            device.owner="";
            device.updateInterval=180;
          });
        return data;
        }
      }
  },
  methods: { //Metoder
    Regga(Device){
            this.$store.dispatch("RegisterDevice",Device).then(res => {
      console.log(res);
    });
    } ,
       emptydata(macAddress){
            this.$store.dispatch("ClearData",macAddress).then(res => {
              this.Devicedata=null;
      // console.log(res);
    });
    } ,
       remove(macAddress){
            this.$store.dispatch("RemoveDevice",macAddress).then(res => {
      
      this.popup=false;
    });
    } ,
      Visa(Device){
           this.$store.dispatch("GetDevice",Device.macAddress).then(res => {
    console.log(res);
      this.CurrentDevice=this.$store.getters.currentDevice;
      if(this.CurrentDevice.data.length!=0)//Tar fram alla datavärden och delar upp dem på de olika typerna
      {
        let heat=[];
        let hum= [];
        let time=[];
        let downloaddata=[];//Downloaddata for the excelbutton.
        this.CurrentDevice.data.forEach(eachMesurement => {
          heat.push(eachMesurement.temperature);
          hum.push(eachMesurement.humidity);
          let timestring= new Date(eachMesurement.time *1000)
          time.push(timestring.toUTCString());
          let eachvalue={name: this.CurrentDevice.name,owner:this.CurrentDevice.macaddress,macaddress:this.CurrentDevice.macaddress,
          created: this.CurrentDevice.utcTimeCreated,temperature:eachMesurement.temperature,humidity:eachMesurement.humidity,time:timestring};
        downloaddata.push(eachvalue);
        });
        this.json_data=downloaddata;
      //Skapar chartdata för Heat och humidity
      this.Devicedata=  {
      labels: time,
      datasets: [
        {
          label: 'Heat',
          backgroundColor: '#f87979',
          data: heat
        },
         {
          label: 'Humidity',
          backgroundColor: '#7de067',
          data: hum
        }
      ]
    };
    console.log(this.Devicedata);
    }
                 this.popup=true;
   
    });
    } ,
 }

}
</script>

<!-- CSS -->
<style scoped>
.l1{
  background-color: green;
  
}
h4{
  font-size:15px;
}
.big{
font-size: 25px;
}
#Cooltext{
    color:black;
    text-decoration: underline; 
}
</style>
