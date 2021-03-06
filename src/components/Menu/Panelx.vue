<template>
<GridLayout width="100%" columns="6*,10*,35" rows="*" >

    <nButton
        col=2
        myClass="exit fas"
        @tap="toggleMenu"
        :myLabel="String.fromCharCode( '0x' + 'f00d' )"
    />


    <StackLayout col=1 id="instituteRail" orientation="horizontal" >
        <Image 
            v-for="x of $store.state.appConfig.institutes"
            :key=x
            class="flag"
            @tap="toggleInstitute(x)"
            :src="  'res://flag_' + x + 
                ( $store.state.appConfig.activeInstitutes.includes(x) ? '' : '_gray' )"
        />
    </StackLayout>

    <StackLayout col=0 id="user" @tap="darkModeToggler()" >
        <Label class="fas" :text="String.fromCharCode( '0x' + 'f2c1' )" />
        <Label class="name" :text="$store.state.appConfig.email.split('@')[0]  " />
    </StackLayout>


</GridLayout>
</template>

// -- =====================================================================================

<script lang="ts">

// -- =====================================================================================

// * npm i --save vue-class-component vue-property-decorator
import { Vue, Component, Prop }         from "vue-property-decorator"
import * as NS                          from "@nativescript/core"
import * as TS                          from "@/../types/myTypes"
import * as TM                          from "@/mixins/themeManager"
import store                            from "@/mixins/store"
import nButton                          from "@/components/tools/n_Button.vue"
import Institute                        from "@/components/Institute.vue"
import Bus                              from "@/mixins/bus"
import * as tools                       from "@/mixins/tools"

// -- =====================================================================================

@Component ( { 
    components: { nButton } 
} )

// -- =====================================================================================

export default class Panel extends Vue {

// -- =====================================================================================

toggleMenu () {
    Bus.$emit( "Menu_ToggleMenu" )
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

}

// -- =====================================================================================

</script>

// -- =====================================================================================

<style scoped>

/*                                          */
    #panel {
        text-align: center;
        border-radius: 10 10 0 0;
        padding: 0;
        margin: 0;
        height: 200;
    }

    .light #panel { background-color: #01a9f7 }
    .dark  #panel { background-color: #0d4368 }

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
    .dark  #user { color: #04243a }

    .exit {
        text-align: center;
        font-size: 30;
        width: 35;
        height: 35;
        border-radius: 10;
        vertical-align : top;
        margin: 10 15 0 0;
    }

    .light .exit { color: #e4e4e4 }
    .dark  .exit { color: #093a5a }

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