<template>
<GridLayout row=1 rows="auto,*,auto,7*,auto,auto,20" columns="*" >

    <Label
        text="Which languages do you want to study?"
        row=0 
        class="format_1 centeredText" 
        textWrap="true"  
    />

    <ScrollView row=1 rowSpan=3 >
        <StackLayout>

            <GridLayout 
                columns="45,*,55" 
                class="institutesOfferBox" 
                v-for="item in institutes" 
                :key="item.code" 
                @tap="instituteSelector(item.code)"
            >

                <Label 
                    col=0 
                    class="far centeredText iconColor_1" 
                    :text="String.fromCharCode( 
                        $store.state.appConfig.activeInstitutes.includes( item.code ) ? 
                            '0xf14a':'0xf0c8' )"
                />
                <Label col=0 colSpan=2 class="format_3 centeredText" :text="item.name" />
                <Image col=2 :src="'res://flag_' + item.code" stretch="aspectFill" />

            </GridLayout>

        </StackLayout>
    </ScrollView>

    <Label v-if="selectOneHint" row=4 class="format_4 centeredText" textWrap="true">
        <FormattedString>
            <Span class="fas hintIconError" :text="String.fromCharCode( '0xf12a' )" />
            <Span text="  at least one language should be selected!" />
        </FormattedString>
    </Label>

    <Label row=5 class="format_2 centeredText" textWrap="true">
        <FormattedString>
            <Span class="fas hintIconOk" :text="String.fromCharCode( '0xf129' )" />
            <Span text="  You can add / remove more languages later!" />
        </FormattedString>
    </Label>

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

// -- =====================================================================================

@Component ( { 
    components: { } 
} )

// -- =====================================================================================

export default class Two extends Vue {

// -- =====================================================================================

@Prop() selectOneHint;

// -- =====================================================================================

institutes = [

    { name: "English", code: "en" } ,
    { name: "Deutsch", code: "de" } ,
    { name: "Italian", code: "it" } ,
    // { name: "Turkish", code: "tr" } ,

]

// -- =====================================================================================

instituteSelector ( code: string ) {
    
    this.selectOneHint = false;

    let index = store.state.appConfig.activeInstitutes.indexOf( code );

    // .. remove from the list
    if( index > -1 ) {
        store.state.appConfig.activeInstitutes.splice( index, 1 );
    }
    // .. add to the list
    else {
        store.state.appConfig.activeInstitutes.push( code );
    }

    // .. sort Alphabetically
    store.state.appConfig.activeInstitutes.sort ( (a,b) => {
        if ( a.toLowerCase() == b.toLowerCase() ) return 0;
        if ( a.toLowerCase() >  b.toLowerCase() ) return 1;
        return -1;
    } );

}

// -- =====================================================================================

}

// -- =====================================================================================

</script>

// -- =====================================================================================

<style scoped>

@import './FirstMeet.css';

/*                                          */

    .institutesOfferBox {
        width: 200;
        height: 40;
        margin: 5;
        border-radius: 7;
        border-width: 1;
        background-color: rgba(0, 0, 0, 0.2);
    }

    .institutesOfferBox Image {
        border-radius: 0 7 7 0;
        opacity: .8;
        background-color: transparent;
    }
</style>