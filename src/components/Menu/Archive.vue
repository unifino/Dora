<template>

    <nButton
        :myClass="'opt-item fas ' + archiveMode"
        :myLabel="String.fromCharCode( '0x' + 'f187' )"
        @tap="toggleArchive"
    />

</template>

// -- =====================================================================================

<script lang="ts">

// -- =====================================================================================

// * npm i --save vue-class-component vue-property-decorator
import { Vue, Component, Prop }         from "vue-property-decorator"
import nButton                          from "@/components/tools/n_Button.vue"
import Institute                        from "@/components/Institute.vue"
import * as tools                       from "@/mixins/tools"
import store                            from "@/mixins/store"
import Bus                              from "@/mixins/bus"

// -- =====================================================================================

@Component ( {
    components: { nButton }
} )

// -- =====================================================================================

export default class Archive extends Vue {

// -- =====================================================================================

get archiveMode () {
    return store.state.archiveMode ? "archiveOn" : "archiveOff"
} 

// -- =====================================================================================

toggleArchive () {

    store.state.archiveMode = !store.state.archiveMode;

    let travelInfo = tools.instituteTravel()
    Bus.$emit( "Base_HeadToInstitute", travelInfo )

    
        

}

// -- =====================================================================================

}

// -- =====================================================================================

</script>

// -- =====================================================================================

<style scoped>

/*                                          */
    .light .archiveOff { color: #c2c3c4 }
    .dark  .archiveOff { color: #247d98 } 

    .light .archiveOn { color: #cfd197 }
    .dark  .archiveOn { color: #d68830 } 

</style>