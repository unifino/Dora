<template>

<GridLayout class="opt-item">

    <nButton
        ref="luncher"
        myClass="opt-item r fas"
        :myLabel="String.fromCharCode( '0x' + 'f004' )"
        @tap="fav"
        @long-press="longPressed"
    />

    <Label class="count" :text="count" />

</GridLayout>

</template>

// -- =====================================================================================

<script lang="ts">

// -- =====================================================================================

// * npm i --save vue-class-component vue-property-decorator
import { Vue, Component, Prop }         from "vue-property-decorator"
import store                            from "@/mixins/store"
import nButton                          from "@/components/tools/n_Button.vue"
import Bus                              from "@/mixins/bus"
import * as storage                     from "@/mixins/storageHandler"
import * as NS                          from "@nativescript/core"
import * as tools                       from "@/mixins/tools"
import * as TS                          from "@/../types/myTypes"
import Salon_F                          from "@/components/Salon/F/Salon_F.vue"

// -- =====================================================================================

@Component ( {
    components: { nButton }
} )

// -- =====================================================================================

export default class Favorite extends Vue {

count = -1;
ins: string;

// -- =====================================================================================

mounted () {
}

// -- =====================================================================================

init ( ins: string ) {

    this.ins = ins;
    this.count = store.state.favsDB[ ins ].length

}

// -- =====================================================================================

fav () {

    store.state.placeTrigger.Salon_F = {
        position: ( this.$refs.luncher as any ).nativeView.getLocationInWindow(),
        size: ( this.$refs.luncher as any ).nativeView.getActualSize()
    } 

    // .. find favorites in sentenceBOX
    let favs = store.state.sentenceBox[ this.ins ].filter( 
        x => store.state.favsDB[ this.ins ].includes( x[0] ) 
    )
    
    // .. replace activeBox
    store.state.activeBox[ this.ins ] = favs

    Vue.prototype.$navigateTo( Salon_F, {
        frame            : "salon_F" ,
        backstackVisible : true ,
    } )

}

// -- =====================================================================================

longPressed () {

}

// -- =====================================================================================

}

// -- =====================================================================================

</script>

// -- =====================================================================================

<style scoped>

/*                                          */

    .count {
        font-size: 12;
        font-family: Farsan-Regular;
        text-align: center;
        width: 18;
        height: 18;
        border-radius: 20;
        margin: 30 0 0 33;
        color: whitesmoke;
    }

    .light .count { background-color: rgba(20, 22, 12, 0.7) }
    .dark  .count { background-color: rgba(105, 98, 104, 0.5) }

    .light .r { color: #9c0a42; }
    .dark  .r { color: #9c0a42; }

    .opt-item { margin: 0 0 0 0 }

</style>