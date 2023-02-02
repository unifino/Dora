<template>
<GridLayout 
    class="curtain" 
    rows="*,auto,8*" 
    columns="*,auto,*"
    :visibility="isItemVisible ? 'visible' : 'collapsed'"
>

<!---------------------------------------------------------------------------------------->

<GridLayout v-if="!finished" row=0 colSpan=3 class="header">

    <GridLayout rows="*" columns="*" padding="20 0 0 0">
        <Label class="centeredText" text="Welcome" />
    </GridLayout>


</GridLayout>

<!---------------------------------------------------------------------------------------->

<Label v-if="!finished" row=1 colSpan=3 class="separator" />

<!---------------------------------------------------------------------------------------->

<GridLayout row=2 col=1 rows="0,*,50" class="actionWindow" >

<!--                                                                         -->

    <Zero  :visibility="step===0 ? 'visible' : 'collapsed'" @stateUpdate=stepTexting ref="zero" />
    <One   :visibility="step===1 ? 'visible' : 'collapsed'" />
    <Two   :visibility="step===2 ? 'visible' : 'collapsed'" :selectOneHint=selectOneHint />
    <Three :visibility="step===3 ? 'visible' : 'collapsed'" />

<!--                                                                         -->
    
    <GridLayout v-if="!finished" row=2 width="270" columns="50,*,50">
        
        <nButton 
            v-if="step>0"
            col=0 
            :myLabel="String.fromCharCode( '0xf053' )" 
            myClass="miniBack_1_Button fas" 
            @tap="previousStep()" 
        />
        
        <nButton 
            col=1 
            :myLabel="stepText" 
            myClass="ordinaryButton" 
            @tap="nextStep()" 
            :visibility="stepText ? 'visible' : 'collapsed'"
        />

    
    </GridLayout>

<!--                                                                         -->

    <GridLayout v-if="finished" row=2 width="270" columns="50,*,50">
        <Label col=1 class="format_6 centeredText" text="saving setting ..." />
    </GridLayout>

</GridLayout>

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
import nButton                          from "@/components/tools/n_Button.vue"
import Zero                             from "@/components/SETUPFirstMeet/Zero.vue"
import One                              from "@/components/SETUPFirstMeet/One.vue"
import Two                              from "@/components/SETUPFirstMeet/Two.vue"
import Three                            from "@/components/SETUPFirstMeet/Three.vue"
import * as storage                     from "@/mixins/storageHandler"

// -- =====================================================================================

@Component ( {
    components: { nButton, Zero, One, Two, Three }
} )

// -- =====================================================================================

export default class FirstMeetModule extends Vue {

step: number = 0;
stepText = "";
stepLimit: number = 3;
finished: boolean= false;
isItemVisible = false;
selectOneHint: boolean = false;

// -- =====================================================================================

init () {
    this.isItemVisible = true;
}

// -- =====================================================================================

stepTexting( newValue? ) {    
    if      ( newValue === "newEmailRegistered" )       this.stepText = "Register";
    else if ( newValue === "emailNeedsToBeVerified" )   this.stepText = "Get code";
    else if ( newValue === "requestingCode" )           this.stepText = "";
    else if ( newValue === "registered" )               this.stepText = "Next";
    else if ( newValue === "ERR" )                      this.stepText = "ERROR!";
    else this.stepText = this.step < this.stepLimit ? "Next" : "Start";
}

// -- =====================================================================================

nextStep () {

    if ( this.stepText === "Get code" ) {
        ( this.$refs.zero as Zero ).getCode();
        return 0;
    }

    if ( this.stepText === "Register" ) {
        this.stepText = "";
        ( this.$refs.zero as Zero ).register();
        return 0;
    }

    if ( this.stepText === "ERROR!" ) {
        tools.toaster( "Registration Failed!" );
        store.state.appConfig.email = "guest";
    }

    if ( this.step === this.stepLimit ) this.submitter();

    this.step = this.step <= this.stepLimit ? this.step +1 : this.stepLimit;

    if ( this.step === 3 && store.state.appConfig.activeInstitutes.length < 1 ) {
        this.selectOneHint = true;
        this.step--;
    } 
    this.stepTexting();

}

// -- =====================================================================================

previousStep  () {
    this.step--;
    this.step = this.step > -1 ? this.step : 0;
}

// -- =====================================================================================

submitter () {

    this.finished = true;

    storage.saveAppConfig().then( () => { 
        this.isItemVisible = false;
        this.finished = false; 
        this.$emit( "restart" ); 
    } );

    // TODO              catch( () => {} );
    
}

// -- =====================================================================================

}

// -- =====================================================================================

</script>

// -- =====================================================================================

<style scoped>

    .curtain {
        background-color: #125689; 
        padding: 30; 
    }

    .header {
        font-size: 18px;
        font-family: TextMeOne-Regular;
        font-weight: bold;
        color: #0e2335;
        width: auto;
    }

    .separator {
        border-color: #0e2335;
        border-width: 1 0 0 0;
        width: 77%;
        height: 1;
        margin-bottom: 20;
    }

    .actionWindow {
        width: auto;
    }

    .iconColor_1 {
        color: #c5c1a9;
    }

</style>




