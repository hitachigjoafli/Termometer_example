
    <Line
      :chartdata="chartdata"
      :options="options"/>

<script>
//Bibliotek som ska användas
import { Line } from 'vue-chartjs'
export default {
    extends: Line,
  name: 'DataChart',
   props: {//Data som skickas in i komponenten
   chartdata: {
      type: Object,
      default: null
    },
  },
  data() {//All data som ska finnas i komponenten
    return {
         options: {
      responsive: true,
      maintainAspectRatio: false
    },

    }
  },
  created() { //När komponenten är skapad
   console.log("Created");
  },
  mounted() { //När komponenten är mountad (inladdad)
    this.renderChart(this.chartdata, this.options)

  }
}
</script>

<!-- CSS -->
<style scoped>

</style>
