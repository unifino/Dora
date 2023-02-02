<template>
<StackLayout>

    <GridLayout ref="rail" rows="50,*,50" height="130" >

<!---------------------------------------------------------------------------------------->

        <GridLayout ref="cabinet" height="30" row=1 columns="*,*" padding="0 20" >

            <GridLayout
                width="50%"
                col=0
                rows="auto,auto"
                columns="auto,auto"
            >

                <Label row=0 col=0 class="switchTitle centeredText" text="Dark Mode" /> 
                <Switch
                    row=0
                    col=1
                    ref="darkModeSwitch"
                    class="switch"
                    :checked="$store.state.darkMode"
                    @tap="darkModeToggler();autoCollapse();"
                />

            </GridLayout>

<!---------------------------------------------------------------------------------------->

            <GridLayout
                width="50%"
                col=1
                rows="auto,auto"
            >

                <Label
                    row=0
                    class="sortButton centeredText"
                    :text="sortPhase.name"
                    @tap="$emit('sort-toggler');autoCollapse();"
                /> 

            </GridLayout>

<!---------------------------------------------------------------------------------------->

        </GridLayout>

<!---------------------------------------------------------------------------------------->

        <Label
            row=2
            class="fas launcher"
            :text="String.fromCharCode( '0x' + launcherLabel )"
            @tap="launcher();autoCollapse();"
        />

<!---------------------------------------------------------------------------------------->

    </GridLayout>

</StackLayout>
</template>

// -- =====================================================================================

<script lang="ts">

// -- =====================================================================================

import { Vue, Component, Prop }         from "vue-property-decorator"
import * as NS                          from "@nativescript/core"
import * as TS                          from "@/../types/myTypes"
import * as TM                          from "@/mixins/themeManager"
import store                            from "@/mixins/store"
import { Enums }                        from "@nativescript/core"
import * as tools                       from "@/mixins/tools"

// -- =====================================================================================

@Component

// -- =====================================================================================

export default class FlashCard_Menu extends Vue {

// -- =====================================================================================

@Prop() sortToggler;
@Prop() sortPhase;

// -- =====================================================================================

expand = true;
travelDistance = 50;
collapse_TO: NodeJS.Timeout | any;

// -- =====================================================================================

get launcherLabel() {
    return this.expand ? "f077" : "f078"
};

// -- =====================================================================================

mounted () {

    ( this.$refs.rail as any ).nativeView.translateY = -this.travelDistance;
    ( this.$refs.rail as any ).nativeView.opacity = 0;
    ( this.$refs.cabinet as any ).nativeView.opacity = 0;
    this.expand = false;

}

// -- =====================================================================================

wakeUp ( delay: number ) {
    ( this.$refs.rail as any ).nativeView.animate( { opacity: 1, delay: delay } );
}

// -- =====================================================================================

darkModeToggler () { 

    TM.darkModeToggler( this.$root.$children[0].$refs );

    setTimeout( () => {
        ( this.$refs.darkModeSwitch as any ).nativeView.checked = store.state.darkMode
    }, 100 );

}

// -- =====================================================================================

launcher () {

    this.expand = !this.expand;
    let pos = this.expand ? 0 : -this.travelDistance;
    ( this.$refs.rail as any ).nativeView.animate( {
        translate: { x: 0, y: pos },
        duration: 350,
        curve: Enums.AnimationCurve.easeOut
    } );

    ( this.$refs.cabinet as any ).nativeView.animate( {
        opacity: this.expand ? 1 : 0,
        duration: 100,
        curve: Enums.AnimationCurve.easeOut
    } );

}

// -- =====================================================================================

autoCollapse () {

    if ( this.collapse_TO ) clearTimeout( this.collapse_TO );
    
    if ( this.expand ) {
        
        this.collapse_TO = setTimeout( () => { 
            if ( this.expand ) this.launcher();
        }, 3000 );
    
    }

}

// -- =====================================================================================

}

// -- =====================================================================================

</script>

// -- =====================================================================================

<style scoped>

    .light .switchTitle { 
        color: #a5a5a7;
    }

    .dark .switchTitle { 
        color: #555454;
    }
    
    .switchTitle {
        font-weight: bold;
        font-size: 15px;
        font-family: TextMeOne-Regular;
        padding: 0 15;
    }

    .dark .switch{
        color: #17422e;
        background-color: #858686;
    }

    .light .switch{
        color: #c0c0bc;
        off-background-color: #afafaf;
    }

    .sortButton {
        border-radius: 7;
        padding: 5 10;
        margin-left: 40;
        width: 100;
        font-family: TextMeOne-Regular;
    }

    .light .sortButton {
        background-color: #2095da;
        color: white;
    }
    .dark .sortButton {
        background-color: #0c5252;
        color: #dde4e6;

    }

    .launcher {
        font-size: 27px;
        text-align: center;
        padding: 10;
        opacity: .3;
    }

</style>