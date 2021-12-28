<template>
<GridLayout ref="curtain" class="fx" rows="*,auto">

<!---------------------------------------------------------------------------------------->

    <GridLayout
        row=1
        rows="60,1,*"
        class="panel"
        ref="panel"
    >

<!---------------------------------------------------------------------------------------->

        <GridLayout
            row=0
            columns="18,*,auto,10"
            ref="panel_header"
            :visibility="app_mode === 'development' ? 'visible' : 'collapsed'"
        >

            <StackLayout col=1 orientation="horizontal" horizontalAlignment="left">
                <Archive />
                <!-- <Filter /> -->
                <Search />
                <!-- <FilterButtons /> -->
                <SalonFIcon />
            </StackLayout>

            <StackLayout col=2 orientation="horizontal" horizontalAlignment="right">
                <Dictionary ref="Dictionary" />
                <Ram ref="Ram" />
                <Battery />
                <Gear />
            </StackLayout>

        </GridLayout>

        <GridLayout
            row=0
            rows="*,auto,*"
            columns="18,*,*,auto,*,10"
            ref="panel_header"
            :visibility="app_mode === 'production' ? 'visible' : 'collapsed'"
        >
            <SalonFIcon col=1 rowSpan=3 />
            <Label row=1 col=3 text="Dora - Deutsche - A1 - Student Version" />
        </GridLayout>

<!---------------------------------------------------------------------------------------->

        <StackLayout row=1 class="divider"></StackLayout>

<!---------------------------------------------------------------------------------------->

        <GridLayout row=2 width="100%" columns="18,140,*,35" rows="*" >

            <StackLayout col=1 id="user" @tap="darkModeToggler()" >
                <Label class="fas" :text="String.fromCharCode( '0x' + 'f2c1' )" />
                <Label class="name" :text="$store.state.appConfig.email.split('@')[0]  " />
            </StackLayout>

            <StackLayout col=2 id="instituteRail" orientation="horizontal" >
                <Image 
                    v-for="x of $store.state.appConfig.institutes"
                    :key=x
                    class="flag"
                    @tap="toggleInstitute(x)"
                    :src="  'res://flag_' + x + 
                        ( $store.state.appConfig.activeInstitutes.includes(x) ? '' : '_gray' )"
                />
            </StackLayout>

        </GridLayout>

<!---------------------------------------------------------------------------------------->

    </GridLayout>

<!---------------------------------------------------------------------------------------->

</GridLayout>
</template>

// -- =====================================================================================

<script lang="ts">

// -- =====================================================================================

// * npm i --save vue-class-component vue-property-decorator
import { Vue, Component, Prop }         from "vue-property-decorator"
import SalonFIcon                       from "@/components/Salon/F/Salon_F_Icon.vue"
import Gear                             from "@/components/Menu/Gear.vue"
import Battery                          from "@/components/Menu/Battery.vue"
import FilterButtons                    from "@/components/Menu/FilterButtons.vue"
import Filter                           from "@/components/Menu/Filter.vue"
import Search                           from "@/components/Menu/Search.vue"
import Ram                              from "@/components/Menu/Ram.vue"
import Dictionary                       from "@/components/Menu/Dictionary.vue"
import Archive                          from "@/components/Menu/Archive.vue"
import Bus                              from "@/mixins/bus"
import store                            from "@/mixins/store"
import * as NS                          from "@nativescript/core"
import * as TM                          from "@/mixins/themeManager"
import * as tools                       from "@/mixins/tools"

// -- =====================================================================================

@Component ( {
    components: {
        SalonFIcon,
        Gear,
        Battery,
        FilterButtons,
        Filter,
        Archive,
        Ram,
        Dictionary,
        Search
    }
} )

// -- =====================================================================================

export default class MenuPanel extends Vue {

// -- =====================================================================================

expanded = true;

// -- =====================================================================================

get app_mode () {
    return TNS_ENV;
}

// -- =====================================================================================

mounted () {
    Bus.$on( "Panel_ToggleExpansion", this.toggleExpansion )
}

// -- =====================================================================================

toggleExpansion (): Promise<void> {

    return new Promise( (rs, rx) => {

        this.expanded = !this.expanded;

        store.state.mode = this.expanded ? "setting" : "idle";

        ( this.$refs.curtain as any ).nativeView.animate( {
            backgroundColor: this.expanded ? "rgba(0,0,0,.7)" : "rgba(25,25,25,0)",
        } );

        ( this.$refs.panel as any ).nativeView.animate( {
            translate: {
                x:0,
                y: this.expanded ? 0 : 200
            }
        } )
        .then( () => rs() );

        let is = store.state.inHand.institute;
        if ( !this.expanded )
            if ( !store.state.appConfig.activeInstitutes.includes( is ) )
                Bus.$emit( "Base_SwipeControl", { direction: NS.SwipeDirection.left } );

    } )

}

// -- =====================================================================================

darkModeToggler () { TM.darkModeToggler( this.$root.$children[0].$refs ) }

// -- =====================================================================================

toggleInstitute ( ins ) {

    let i = store.state.appConfig.activeInstitutes.indexOf( ins );

    if ( i > -1 ) {
        if ( store.state.appConfig.activeInstitutes.length === 1 )
            tools.toaster( "Keep at-least one Institute active!" );
        else
            store.state.appConfig.activeInstitutes.splice( i,1 );
    }

    else store.state.appConfig.activeInstitutes.push( ins );

}

// -- =====================================================================================

destroyed () {
    Bus.$off( "Menu_ToggleMenu" )
}

// -- =====================================================================================

}

// -- =====================================================================================

</script>

// -- =====================================================================================

<style scoped>

/*                                          */
    .panel {
        width: 100%;
        height: 260;
    }

    .light .panel { background-color: #003d47 }
    .dark  .panel { background-color: #0a2429 }

    .divider {
        height: 1;
        width: 100%;
        background-color: #7f8a8f;
        margin: 25 0;
    }

    #user {
        text-align: center;
        border-radius: 5;
        width: 100;
        font-size: 110; 
        vertical-align : top;
        margin: 33 0;
    }

    .name {
        margin-top: 5;
        font-size: 12;
    }

    .light #user { color: #abe5ff }
    .dark  #user { color: #4e4f50 }

    #instituteRail {
        height: 70;
        width: 50%;
        horizontal-align : center;
    }

    .flag {
        width: 40;
        height: 40;
        border-radius: 40;
        margin: 0 5;
    }

</style>