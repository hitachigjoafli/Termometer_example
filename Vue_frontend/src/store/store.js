import Vue from 'vue'
import Vuex from 'vuex'
import axios from "axios";
Vue.use(Vuex)

// root state object.
// each Vuex instance is just a single state tree.
const state = {
  unReggedDevices: [],
  ReggedDevices: [],
  CurrentDevice: null,
  loadingStatus:"not loading"
}

// mutations are operations that actually mutates the state.
// each mutation handler gets the entire state tree as the
// first argument, followed by additional payload arguments.
// mutations must be synchronous and can be recorded by plugins
// for debugging purposes.
const mutations = {
    Loading_Status (state,Status) {
        state.loadingStatus = Status;
      },
      Get_Unregged_Devices (state,unReggedDevices) {
        state.unReggedDevices = unReggedDevices;
      },
      Get_Regged_Devices (state,reggedDevices) {
        state.ReggedDevices = reggedDevices;
      },
      Get_Device (state,Device) {
        state.CurrentDevice = Device;
      },
      Remove_Device (state,macAddress) {
           let regged=  state.ReggedDevices;
      let FindDevice= regged.find(Device => Device.macAddress === macAddress);
        let Deviceindex =regged.indexOf(FindDevice);
        regged.splice(Deviceindex, 1); 
        state.ReggedDevices = regged;
      },
      Register_Device (state,newlyreggeddevice) {
      //  //Add device to regged
        let regged=  state.ReggedDevices;
        regged.push(newlyreggeddevice);
      //   //Removes device from unregged
        let unregged=state.unReggedDevices;
        let Deviceindex =unregged.indexOf(newlyreggeddevice);
        unregged.splice(Deviceindex, 1);
        state.unReggedDevices = unregged; 
        state.ReggedDevices = regged;
      },
}

// actions are functions that cause side effects and can involve
// asynchronous operations.
const actions = {
       GetUnreggedDevices: ({ commit }) => {
        let data= "";
          axios.get('https://agafh7et1a.execute-api.us-east-1.amazonaws.com/iot/device/unregistered')
      .then(function (response) {        // handle success
        console.log(response);
         data= JSON.parse(response.data.body);
        console.log(data);
        commit('Get_Unregged_Devices',data);
      })
      .catch(function (error) {        // handle error
        console.log(error);
        return "Något gick fel";
      })
      }, 
       GetreggedDevices: ({ commit }) => {
        let data= "";
          axios.get('https://agafh7et1a.execute-api.us-east-1.amazonaws.com/iot/device/registered')
      .then(function (response) {        // handle success
        console.log(response);
         data= JSON.parse(response.data.body);
        console.log(data);
        commit('Get_Regged_Devices',data);
      })
      .catch(function (error) {        // handle error
        console.log(error);
        return "Något gick fel";
      })
      },
      GetDevice: ({ commit },macAddress) => {

        return new Promise((resolve, reject) => {
          let data= "";
          axios.get('https://agafh7et1a.execute-api.us-east-1.amazonaws.com/iot/device?MAC='+macAddress)
      .then(function (response) {        // handle success
        console.log(response);
         data= response.data;
        commit('Get_Device',data);
        resolve(response.data);
      })
      .catch(function (error) {        // handle error
        reject(error);
      })
      
      })
        
      },
      RegisterDevice: ({ commit }, Device) => {
        
         Device.updateInterval= parseInt(Device.updateInterval); 
         console.log(typeof(Device.updateInterval));
         commit('Register_Device',Device);
        let data=JSON.stringify(Device);
        console.log(data);
          axios.put('https://agafh7et1a.execute-api.us-east-1.amazonaws.com/iot/device/registered?MAC='+Device.macAddress,data)
      .then(function (response) {        // handle success
        console.log(response);
         data= JSON.parse(response.data.body);
        console.log(data);
      })
      .catch(function (error) {        // handle error
        console.log(error);
        return "Något gick fel";
      })
      },
      ClearData: ({ commit }, macAddress) => {
        
         axios.delete('https://agafh7et1a.execute-api.us-east-1.amazonaws.com/iot/device/data?MAC='+macAddress)
     .then(function (response) {        // handle success
       console.log(response);
       return "Det gick bra";
     })
     .catch(function (error) {        // handle error
       console.log(error);
       return "Något gick fel";
     })
     },
     RemoveDevice: ({ commit }, macAddress) => {
      commit('Remove_Device',macAddress);
      axios.delete('https://agafh7et1a.execute-api.us-east-1.amazonaws.com/iot/device/registered?MAC='+macAddress)
      .then(function (response) {        // handle success
        console.log(response);
      })
      .catch(function (error) {        // handle error
        console.log(error);
        return "Något gick fel";
      })
      },

}

// getters are functions
const getters = {
  unreggedDevices: state => state.unReggedDevices,
  reggedDevices: state => state.ReggedDevices,
  currentDevice: state => state.CurrentDevice,
}

// A Vuex instance is created by combining the state, mutations, actions,
// and getters.
export default new Vuex.Store({
  state,
  getters,
  actions,
  mutations
})