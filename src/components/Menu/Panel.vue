<template>
<GridLayout class="fx" rows="*,auto">

<!---------------------------------------------------------------------------------------->

    <GridLayout
        row=1
        columns="18,*,auto,10"
        class="panel"
    >

        <StackLayout col=1 orientation="horizontal" horizontalAlignment="left">
            <Archive />
            <A />
            <SalonFIcon />
         </StackLayout>

        <StackLayout col=2 orientation="horizontal" horizontalAlignment="right">
            <Ram />
            <Battery />
            <Gear />
        </StackLayout>

        <!-- <Filter /> -->

    </GridLayout>

<!---------------------------------------------------------------------------------------->

</GridLayout>
</template>

// -- =====================================================================================

<script lang="ts">

// -- =====================================================================================

// * npm i --save vue-class-component vue-property-decorator
import { Vue, Component, Prop }         from "vue-property-decorator"
import SalonFIcon                       from "@/components/Salon/F/Salon_F_Icon.vue"
import Gear                             from "@/components/Menu/Gear.vue"
import Battery                          from "@/components/Menu/Battery.vue"
import Filter                           from "@/components/Menu/Filter.vue"
import A                                from "@/components/Menu/A.vue"
import Ram                              from "@/components/Menu/Ram.vue"
import Archive                          from "@/components/Menu/Archive.vue"


// -- =====================================================================================

@Component ( { 
    components: { SalonFIcon, Gear, Battery, Filter, A, Archive, Ram } 
} )

// -- =====================================================================================

export default class OptionBar extends Vue {

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
    .panel {
        width: 100%;
        height: 60;
    }

    .light .panel { background-color: #003d47 }
    .dark  .panel { background-color: #0a2429 }

</style>