<template>

    <nButton
        myClass="opt-item fas"
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

// -- =====================================================================================

@Component ( {
    components: { nButton }
} )

// -- =====================================================================================

export default class Archive extends Vue {

// -- =====================================================================================

toggleArchive () {

    let base = this.$root.$children[0].$refs.base as any;
    let institute: Institute = base.$children[1];

    institute.pokAll = !institute.pokAll;
    institute.collector();

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