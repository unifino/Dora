<template>
<GridLayout row=1 rows="auto,*,auto,30,auto,7*,auto,20" columns="*,10,*" >

    <Label
        :text="text"
        row=0
        colSpan=3
        class="format_1 centeredText"
        textWrap="true"
    />

    <TextField
        ref="email"
        row=2
        colSpan=3
        hint="Email Address"
        class="email"
        @textChange="emailChanged"
    />

    <TextField
        ref="code"
        row=2
        colSpan=3
        hint="-----"
        class="code"
        keyboardType="number"
        @textChange="codeChanged"
    />

    <!-- <nButton
        col=2
        row=2
        myLabel="Get code"
        myClass="inlineButton"
        @tap="getCode()"
        horizontalAlignment="right"
        :visibility=" ? 'visible' : 'collapsed'"
    /> -->

    <Label row=6 colSpan=3 class="format_2 centeredText" textWrap="true">
        <FormattedString>
            <Span class="fas" :text="String.fromCharCode( '0xf129' )" />
            <Span text="  Your Email serves as Username!" />
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
import nButton                          from "@/components/tools/n_Button.vue"
import * as tools                       from "@/mixins/tools"
import * as user                        from "@/mixins/user"

// -- =====================================================================================

@Component ( {
    components: { nButton }
} )

// -- =====================================================================================

export default class Zero extends Vue {

// -- =====================================================================================

email = null;
text = "";
code;

// -- =====================================================================================

emailChanged ( event ) {

    function stringIsEmail( str: string ) { 
        var reg = /(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))/;
        return reg.test( str );
    }

    if ( stringIsEmail( event.object.text ) ) {

        this.email = event.object.text.toLowerCase().trim();
        setTimeout( () => { 
            ( this.$refs.email as any ).nativeView.dismissSoftInput()
            user.checkAvailability( this.email )
            .then( isNew => {
                if ( isNew ) this.$emit( "stateUpdate", "newEmailRegistered" );
                else this.$emit( "stateUpdate", "emailNeedsToBeVerified" );
            } )
            .catch( err => this.$emit( "stateUpdate", "ERR" ) );
        }, 350 );

    }

}

// -- =====================================================================================

getCode () {

    this.text = "Please Wait!\n\n\nRequesting verification code ...";
    this.$emit( "stateUpdate", "requestingCode" );
    this.code = tools.randomCode();

    ( this.$refs.email as any ).nativeView.dismissSoftInput();
    ( this.$refs.email as any ).nativeView.visibility = "collapsed";

    user.verificationRequest( this.email, this.code )
    .then( () => {
        ( this.$refs.code as any ).nativeView.visibility = "visible";
        this.text = "Verification Code has been sent!";
    } )
    .catch( err => this.text = "Error!: " + err );

}

// -- =====================================================================================

codeChanged ( event ) {

    let code = ( this.$refs.code as any ).nativeView;

    if ( event.object.text.length === 5 ) {

        if ( event.object.text === this.code ) {

            code.color = "#3b900a";
            ( this.$refs.code as any ).nativeView.dismissSoftInput();
            ( this.$refs.code as any ).nativeView.visibility = "collapsed";

            this.register();

        }
        else code.color = "#b8343a";

    }
    else code.color = "#a8a8a8";

}

// -- =====================================================================================

register () {

    this.text = "Registering ...";

    user.register( this.email )
    .then( () => {
        store.state.appConfig.email = this.email;
        this.text = "Your Email has been registered.";
        this.$emit( "stateUpdate", "registered" );
    } )
    .catch( err => this.text = "Error: " + err )

}

// -- =====================================================================================

}

// -- =====================================================================================

</script>

// -- =====================================================================================

<style scoped>

@import './FirstMeet.css';

/*                                          */

    .format_1 {
        font-family: 'CutiveMono-Regular';
        font-size: 13;
    }

    .email{
        width: 270;
        padding-right: 80;
        border-bottom-width: 1;
        border-color: #dddddd; 
        color: #a8a8a8;
        placeholder-color: #0e2335;
    }

    .code {
        text-align: center;
        width: 170;
        font-size: 20;
        letter-spacing: 1px;
        color: #a8a8a8;
        font-weight: bold;
        placeholder-color: #0e2335;
        visibility: collapse;
    }

    .inlineButton{
        font-size: 12px;
        font-family: Barlow;
        font-weight: bold;
        color: #0e2335;
        border-left-width: 2;
        border-color: #0e2335;
        padding: 5 0;
        width: 75;
        height: 30;
        border-radius: 0;
        vertical-align: middle;
        text-align: center;
    }

</style>