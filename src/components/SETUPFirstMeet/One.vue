<template>

<GridLayout row=1 rows="auto,*,auto,7*,auto,20" columns="*,10,*" >
        
    <Label 
        text="Which theme do you prefer?" 
        row=0 
        colSpan=3 
        class="format_1 centeredText" 
        textWrap="true"  
    />

    <GridLayout 
        row=2 
        col=0 
        rows="auto,*" 
        class="themeOptionBox" 
        @tap="$store.state.appConfig.theme=preThemeDark"
    >
        <Image src="res://dark" stretch="aspectFit" />
        <Label row=1 class="format_1 centeredText selectiveBox_1">
            <FormattedString>
                <Span 
                    class="far" 
                    :text="String.fromCharCode( 
                        $store.state.appConfig.theme===preThemeDark ? 
                            '0xf058':'0xf111' )" 
                />
                <Span text=" Dark" />
            </FormattedString>
        </Label>/>
    </GridLayout>

    <GridLayout 
        row=2 
        col=2 
        rows="auto,*" 
        class="themeOptionBox" 
        @tap="$store.state.appConfig.theme=preThemeLight"
    >
        <Image src="res://light" stretch="aspectFit" />
        <Label row=1 class="format_1 centeredText selectiveBox_1">
            <FormattedString>
                <Span 
                    class="far" 
                    :text="String.fromCharCode( 
                        $store.state.appConfig.theme===preThemeLight ? 
                            '0xf058':'0xf111' )" 
                />
                <Span text=" Light" />
            </FormattedString>
        </Label>/>
    </GridLayout>

    <!-- <Label row=4 colSpan=3 class="format_2 centeredText" textWrap="true">
        <FormattedString>
            <Span class="fas" :text="String.fromCharCode( '0xf129' )" />
            <Span text="  You can find more themes under Settings section!" />
        </FormattedString>
    </Label> -->

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

export default class One extends Vue {

// -- =====================================================================================

// .. allocating one Dark + one Light Theme as pre Themes.
preThemeDark: TS.ThemaName = "DarkGreen";
preThemeLight: TS.ThemaName = "Milky";

// -- =====================================================================================

}

// -- =====================================================================================

</script>

// -- =====================================================================================

<style scoped>

@import './FirstMeet.css';

/*                                          */

    .themeOptionBox {
        height: 250;
        width: 140;
        border-radius: 7;
    }

    .themeOptionBox Image {
        border-radius: 6 6 3 3;
    }

    .selectiveBox_1 {
        background-color: teal;
        border-radius: 6;
        margin-top: 3;
        padding: 5 0 5 -7;
    }

</style>