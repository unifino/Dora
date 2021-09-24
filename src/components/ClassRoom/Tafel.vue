<template>
<GridLayout ref="tafel" class="bookCover" rows="*,auto,*" visibility="hidden">

    <GridLayout row=1 class="pagesBox" >

        <WrapLayout ref="page" class="page">

            <nWord 
             v-for="(word,i) in page" 
             :key="i"
             :myText="word.text" 
             :myClass="word.class" 
             :refId=i
             :autoTranslate=false
            />

        </WrapLayout>

    </GridLayout>

</GridLayout>
</template>

// -- =====================================================================================

<script lang="ts">

// -- =====================================================================================

import { Vue, Component, Prop }         from "vue-property-decorator"
import * as NS                          from "@nativescript/core"
import * as TS                          from "@/../types/myTypes"
import store                            from "@/mixins/store"
import nWord                            from "@/components/tools/n_Word.vue"
import * as storage                     from "@/mixins/storageHandler"
import Bus                              from "@/mixins/bus"

// -- =====================================================================================

@Component ( { 
    components: { nWord } 
} )

// -- =====================================================================================

export default class Tafel extends Vue {

// -- =====================================================================================

etikett: number[] = [];
page: { text: string, class: string }[] = [];
factor = .7;
maxHeight = store.state.windowSize.height * this.factor;
rendering = false;

// -- =====================================================================================

init ( setHeightLimit?: boolean, factor?: number ): Promise<void> {

    if ( factor ) this.factor = factor;

    return new Promise( rs => {

        ( this.$refs.tafel as any ).nativeView.visibility = "visible";

        if ( setHeightLimit ) {
            let h = ( this.$refs.tafel as any ).nativeView.getActualSize().height;
            if ( !h ) return rs( this.init( setHeightLimit ) );
            // TODO very small height????
            this.maxHeight = h * this.factor;
        }

        rs();

    } );

}

// -- =====================================================================================

typeset ( context: TS.UniText[], c=0 ): Promise<number[]> {

    return new Promise ( async rs => { 

        // .. rendering percent...
        Bus.$emit( "ClassRoomEntrance_RenderingBar", ( c / context.length ) *100 | 0 );

        // .. put 100|mean|remaining first words at once in a blank Page
        if ( this.page.length === 0 ) {

            this.rendering = true;
            let max = this.etikett.length > 0 ? 
                ( this.etikett[ this.etikett.length-1 ] / this.etikett.length ) | 0 : 100;

            for ( let i=0; i < max; i++ ) {

                if ( c > context.length-1 ) break;
                let typed = this.typist(c);
                c = typed.c;
                if ( typed.forceNewPage ) {
                    this.page = [];
                    this.etikett.push(c-1);
                    break;
                }

            }
            await this.isRendering();

        }

        // .. add next word
        if ( c < context.length ) {
            this.rendering = true;
            let typed = this.typist(c);
            c = typed.c;
            if ( typed.forceNewPage ) {
                this.etikett.push(c-1);
                this.page = [];
            }
            await this.isRendering();
        }

        // .. check point & eraser
        if ( this.lineal() > this.maxHeight ) {

            while( this.lineal() > this.maxHeight ) {
                this.rendering = true;
                this.page.pop();
                c--;
                await this.isRendering();
            }
            this.rendering = true;
            this.page = [];
            await this.isRendering();
            this.etikett.push(c-1);
        }

        // .. recall | register the etikett
        if ( c < context.length -1 ) rs( this.typeset( context, c ) );
        else {
            this.rendering = true;
            Bus.$emit( "ClassRoomEntrance_RenderingBar", 100 );
            this.page = [];
            await this.isRendering();
            this.etikett.push(c);
            rs( this.etikett );
        }

    } )

}

// -- =====================================================================================

typist ( c: number ) {

    let className = "word";
    let newPage = false;

    let data = store.state.inHand.lesson.protoplasm.find( x => x.type === "dText" ).content[c];
    let text = data[0];

    // TODO .. there is Blank Text

    // .. first BreakLine on the beginning of each page will not be shown
    if ( data[1].isBreakLine ) className = this.page.length === 0 ? "hidden" : "breakLine"; 

    this.page.push( { text: text, class: className } );

    c++;

    return { c: c, forceNewPage: newPage };

}

// -- =====================================================================================

isRendering (): Promise<void> {

    return new Promise ( rs => { 
        if ( this.rendering ) setTimeout( () => rs( this.isRendering() ) , 10 );
        else rs();
    } );

}

// -- =====================================================================================

lineal () {

    let page = ( this.$refs.page as any ).nativeView;
    return page.getActualSize().height | 0;

}

// -- =====================================================================================

updated () {
    this.rendering = false;
}

// -- =====================================================================================

}

// -- =====================================================================================

</script>

// -- =====================================================================================

<style scoped>

/*                                          */

    /* ! should be same as Book.vue */
    .bookCover { width: auto }
    .pagesBox { width: 80% }
    .page { width: 510 }
    /* ! should be same as Book.vue */

</style>