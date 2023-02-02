<template>

    <nButton
        myClass="opt-item filter fas"
        :myLabel="String.fromCharCode( '0x' + 'f0b0' )"
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

export default class Filter extends Vue {

// -- =====================================================================================

// -- =====================================================================================

}

// -- =====================================================================================

</script>

// -- =====================================================================================

<style scoped>

/*                                          */
    /* .light .filter { color: #c2c3c4 }
    .dark  .filter { color: #172124 } */

    .filter {
        font-size: 29;
    }

</style>