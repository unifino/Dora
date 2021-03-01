<template>
<StackLayout 
    orientation="horizontal" 
    horizontalAlignment="right" 
    width="100%" 
    padding="50 0 0 0"
    :background="
        $store.state.mode === 'shoppinga' ? 
            ( $store.state.darkMode ? '#cc003d47' : '#ccf4ddcb' ) : 'transparent' " 
>

<!--                                                                                    -->

    <Battery />
    <SalonFIcon class="fx" />
    <Gear />
    <!-- <Filter /> -->

<!--                                                                                    -->

</StackLayout>
</template>

// -- =====================================================================================

<script lang="ts">

// -- =====================================================================================

// * npm i --save vue-class-component vue-property-decorator
import { Vue, Component, Prop }         from "vue-property-decorator"
import * as NS                          from "@nativescript/core"
import * as TS                          from "@/../types/myTypes"
import store                            from "@/mixins/store"
import SalonFIcon                       from "@/components/Salon/F/Salon_F_Icon.vue"
import Gear                             from "@/components/Menu/Gear.vue"
import Battery                          from "@/components/tools/Battery.vue"
import Filter                           from "@/components/tools/Filter.vue"

// -- =====================================================================================

@Component ( { 
    components: { SalonFIcon, Gear, Battery, Filter } 
} )

// -- =====================================================================================

export default class TopBar extends Vue {

// -- =====================================================================================

beforeDestroy () {}

// -- =====================================================================================

destroyed () {}

// -- =====================================================================================

}

// -- =====================================================================================

</script>

// -- =====================================================================================

<style scoped>

/*                                          */

</style>