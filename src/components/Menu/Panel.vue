<template>
<GridLayout class="fx" rows="*,auto" :visibility="isVisible ? 'visible' : 'collapsed'">

<!---------------------------------------------------------------------------------------->

    <GridLayout
        width="100%"
        height="60"
        row=1
        columns="18,*,auto,10"
        :background=" !$store.state.darkMode ? '#003d47' : '#f4ddcb' "
    >

        <StackLayout col=1 orientation="horizontal" horizontalAlignment="left">
            <B />
            <A />
            <SalonFIcon />
        </StackLayout>

        <StackLayout col=2 orientation="horizontal" horizontalAlignment="right">
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
import B                                from "@/components/Menu/B.vue"
import store                            from "@/mixins/store"


// -- =====================================================================================

@Component ( { 
    components: { SalonFIcon, Gear, Battery, Filter, A, B } 
} )

// -- =====================================================================================

export default class OptionBar extends Vue {

// -- =====================================================================================

get isVisible () {
    if ( store.state.here === 'Institute' && store.state.mode === "idle" ) return true;
    if ( store.state.mode === "setting" ) return true;
    return false;
}

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