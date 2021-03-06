<template>
<GridLayout>

<!---------------------------------------------------------------------------------------->

    <Image ref="image" src="" stretch="aspectFit" />

<!---------------------------------------------------------------------------------------->

</GridLayout>
</template>

// -- =====================================================================================

<script lang="ts">

// -- =====================================================================================

// * npm i --save vue-class-component vue-property-decorator
import { Vue, Component, Prop }         from "vue-property-decorator"
import * as NS                          from "@nativescript/core"
import * as TS                          from "@/../types/myTypes"
import store                            from "@/mixins/store"
import * as tools                       from "@/mixins/tools"
import Bus                              from "@/mixins/bus"

// -- =====================================================================================

@Component ( { 
    components: { } 
} )

// -- =====================================================================================

export default class ImageDisplay extends Vue {

// -- =====================================================================================

async init ( src: string ) {
    ( this.$refs.image as any ).nativeView.visibility = "visible";
    await new Promise( _ => setTimeout( _, 100 ) );
    ( this.$refs.image as any ).nativeView.src = src;
    await new Promise( _ => setTimeout( _, 1000 ) );
    ( this.$refs.image as any ).nativeView.src = "";
    await new Promise( _ => setTimeout( _, 100 ) );
    ( this.$refs.image as any ).nativeView.src = src;
    await new Promise( _ => setTimeout( _, 100 ) );
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