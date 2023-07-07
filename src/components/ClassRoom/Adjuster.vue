<template>
<StackLayout ref="adjuster" id="adjuster" :visibility=visibility >

<!---------------------------------------------------------------------------------------->

    <StackLayout
        :visibility=visibility
        class="buttonRow"
        orientation="horizontal"
        horizontalAlignment="center"
    >

        <nButton
            v-for="(button,i) in buttonsRow2"
            :key="i"
            @tap="button.func()"
            :myLabel="String.fromCharCode( '0x' + button.label )"
            :myClass="'dotButton ' + button.class"
        />

    </StackLayout>

<!---------------------------------------------------------------------------------------->

</StackLayout>
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
import nButton                          from "@/components/tools/n_Button.vue"


// -- =====================================================================================

interface WrappedWord { text: string, cls: string };
interface WrappedLine { i: number, wrappedWords: WrappedWord[], cls: string, ids: number[], text: string }

// -- =====================================================================================

@Component ( {
    components: { nButton }
} )

// -- =====================================================================================

export default class Subtitle extends Vue {

// -- =====================================================================================

content: TS.UniText[];
visibility: 'visible'|'collapsed' = 'collapsed';

buttonsRow2: { label:string, class:string, func: Function }[] = [
    { label: "f068", class: "fas y mini", func: () => { this.adjuster( "A", -.3  ) } } ,
    { label: "f068", class: "fas y",      func: () => { this.adjuster( "A", -1.9 ) } } ,
    { label: "2b",   class: "fas y",      func: () => { this.adjuster( "A", 1.9  ) } } ,
    { label: "2b",   class: "fas y mini", func: () => { this.adjuster( "A", .3   ) } } ,
    { label: ""  ,   class: 'space',      func: () => {}                             } ,
    { label: "f068", class: "fas b mini", func: () => { this.adjuster( "B", -.3  ) } } ,
    { label: "f068", class: "fas b",      func: () => { this.adjuster( "B", -1.9 ) } } ,
    { label: "2b",   class: "fas b",      func: () => { this.adjuster( "B", 1.9  ) } } ,
    { label: "2b",   class: "fas b mini", func: () => { this.adjuster( "B", .3   ) } } ,
];

// -- =====================================================================================

mounted () {}

// -- =====================================================================================

init () {

    this.visibility = "visible";
    let lesson = store.state.inHand.lesson;
    this.content = lesson.protoplasm.find( x => x.type === "dText" ).content;

}

// -- =====================================================================================

async adjuster ( point: 'A' | 'B' , fac: -.3 | .3 | -1.9 | 1.9 ) {

    for ( let i in this.content ) {
        // .. from this line forward
        if ( parseInt(i) >= store.state.preserve.selected[0] )
            if ( this.content[i][1].standoff )
                this.content[i][1].snap += fac;
    }


}

// -- =====================================================================================


destroyed () {
}

// -- =====================================================================================

}

// -- =====================================================================================

</script>

// -- =====================================================================================

<style scoped>

/*                                          */

    #adjuster {
        background-color: #000000;
        padding: 40 30 85 30;
    }

</style>