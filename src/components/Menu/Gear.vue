<template>

    <nButton
        myClass="opt-item gear fas"
        :myLabel="String.fromCharCode( '0x' + 'f013' )"
        @tap="toggleMenu"
    />

</template>

// -- =====================================================================================

<script lang="ts">

// -- =====================================================================================

// * npm i --save vue-class-component vue-property-decorator
import { Vue, Component, Prop }         from "vue-property-decorator"
import nButton                          from "@/components/tools/n_Button.vue"
import Bus                              from "@/mixins/bus"

// -- =====================================================================================

@Component ( {
    components: { nButton }
} )

// -- =====================================================================================

export default class Gear extends Vue {

// -- =====================================================================================

toggleMenu () {
    Bus.$emit( "Panel_ToggleExpansion" )
}

// -- =====================================================================================

}

// -- =====================================================================================

</script>

// -- =====================================================================================

<style scoped>

/*                                          */
    .light .gear { color: #c2c3c4 }
    .dark  .gear { color: #8a8c8d }

    .opt-item { margin: 0 0 0 -15 }

</style>