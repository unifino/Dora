<template>
<AbsoluteLayout width="100%" height="100%" ref="cotton" >

<!--                                                                                    -->

    <Panel ref="panel" id="panel" />

<!--                                                                                    -->

</AbsoluteLayout>
</template>

// -- =====================================================================================

<script lang="ts">

// -- =====================================================================================

import { Vue, Component, Prop }         from "vue-property-decorator"
import * as NS                          from "@nativescript/core"
import * as TS                          from "@/../types/myTypes"
import store                            from "@/mixins/store"
import Bus                              from "@/mixins/bus"
import Gear                             from "@/components/Menu/Gear.vue"
import Panel                            from "@/components/Menu/Panel.vue"

// -- =====================================================================================

type options = "Folder"|"Institute"|"Theme"|"You"|"me";

@Component ( { 
    components: { Gear, Panel }
} )

// -- =====================================================================================

export default class Menu extends Vue {

// -- =====================================================================================

active = true;

// -- =====================================================================================

mounted () {
    Bus.$on( "Menu_ToggleMenu", this.toggleMenu )
}

// -- =====================================================================================

toggleMenu (): Promise<void> {

    return new Promise( (rs, rx) => {

        this.active = !this.active;

        store.state.mode = this.active ? "setting" : "idle";

        ( this.$refs.panel as any ).nativeView.animate( { 
            translate: { 
                x:0, 
                y: this.active ? 
                    store.state.windowSize.height -200 : store.state.windowSize.height +1
            }
        } );

        ( this.$refs.cotton as any ).nativeView.animate( { 
            backgroundColor: this.active ? "rgba(0,0,0,.7)" : "rgba(25,25,25,0)",
        } )
        .then( () => rs() );

        let is = store.state.inHand.institute;
        if ( !this.active )
            if ( !store.state.appConfig.activeInstitutes.includes( is ) )
                Bus.$emit( "Base_SwipeControl", { direction: NS.SwipeDirection.left } );

    } )

}

// -- =====================================================================================

destroyed () {
    Bus.$off( "Menu_ToggleMenu" )
}

// -- =====================================================================================

}

// -- =====================================================================================

</script>

// -- =====================================================================================

<style scoped>

/*                                          */


</style>