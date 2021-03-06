<template>

    <nButton
        myClass="opt-item fas"
        :myLabel="String.fromCharCode( '0x' + 'f187' )"
        @tap="toggleMenu"
    />

</template>

// -- =====================================================================================

<script lang="ts">

// -- =====================================================================================

// * npm i --save vue-class-component vue-property-decorator
import { Vue, Component, Prop }         from "vue-property-decorator"
import store                            from "@/mixins/store"
import nButton                          from "@/components/tools/n_Button.vue"
import Bus                              from "@/mixins/bus"

// -- =====================================================================================

@Component ( { 
    components: { nButton } 
} )

// -- =====================================================================================

export default class B extends Vue {

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
    /* .light .gear { color: #c2c3c4 }
    .dark  .gear { color: #172124 } */

</style>