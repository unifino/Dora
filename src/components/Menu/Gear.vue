<template>

    <nButton
        myClass="gear fas"
        :myLabel="String.fromCharCode( '0x' + 'f013' )"
        @tap="toggleMenu"
        :visibility="isVisible ? 'visible' : 'collapsed'"
    />

</template>

// -- =====================================================================================

<script lang="ts">

// -- =====================================================================================

// * npm i --save vue-class-component vue-property-decorator
import { Vue, Component, Prop }         from "vue-property-decorator"
import * as NS                          from "@nativescript/core"
import * as TS                          from "@/../types/myTypes"
import store                            from "@/mixins/store"
import nButton                          from "@/components/tools/n_Button.vue"
import Institute                        from "@/components/Institute.vue"
import Bus                              from "@/mixins/bus"
import * as tools                       from "@/mixins/tools"

// -- =====================================================================================

@Component ( { 
    components: { nButton } 
} )

// -- =====================================================================================

export default class Gear extends Vue {

// -- =====================================================================================

get isVisible () {
    if ( store.state.here === 'Institute' && store.state.mode === "idle" ) return true;
    if ( store.state.mode === "setting" ) return true;
    return false;
}

// -- =====================================================================================

toggleMenu () {
    Bus.$emit( "Menu_ToggleMenu" )
}

// -- =====================================================================================

}

// -- =====================================================================================

</script>

// -- =====================================================================================

<style scoped>

/*                                          */
    .gear {
        text-align: center;
        font-size: 44;
        width: 70;
        height: 70;
        border-radius: 10;
        margin-right: 20;
    }

    .light .gear { color: #c2c3c4 }
    .dark  .gear { color: #172124 }

</style>