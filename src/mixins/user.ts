import * as NS                          from "@nativescript/core"
import * as TS                          from "@/../types/myTypes"
import * as tools                       from "@/mixins/tools"
import * as storage                     from "@/mixins/storageHandler"
import store                            from "@/mixins/store"

// -- =====================================================================================

export function checkAvailability ( email: string ) {

    return new Promise ( (rs, rx) => {
    
        let url = tools.ssd + 'isNewEmail?';
        url += "&e=" + email;

        NS.Http.getJSON( url ).then(
            ( res: TS.SSD_Res ) => {
                if ( res.status === 200 ) rs( res.answer );
                else rx( res.status + " " + res.reason );
            },
            e => rx( e+'' )
        )
        .catch( e => rx( e+'' ) );
    
    } );

}

// -- =====================================================================================

export function verificationRequest ( email: string, code: string ): Promise<void> {

    return new Promise ( (rs, rx) => {
    
        let url = tools.ssd + 'verificationCode?';
        url += "&e=" + email;
        url += "&c=" + code;

        NS.Http.getJSON( url ).then(
            ( res: TS.SSD_Res ) => {
                if ( res.status === 200 ) rs();
                else rx( res.status + " " + res.reason );
            },
            e => rx( e+'' )
        )
        .catch( e => rx( e+'' ) );
    
    } );

}

// -- =====================================================================================

export function register( email: string ): Promise<void> {

    return new Promise ( (rs, rx) => {

        let url = tools.ssd + 'register?';
        url += "&k=" + tools.key();
        url += "&e=" + email;

        NS.Http.getJSON( url ).then(
            ( res: TS.SSD_Res ) => {
                if ( res.status === 200 ) rs();
                else rx( res.status + " " + res.reason );
            },
            e => rx( e+'' )
        )
        .catch( e => rx( e+'' ) );

    } );

}

// -- =====================================================================================

export function myPurchasedItems () {

    return new Promise ( (rs, rx) => { 

        if ( !store.state.appConfig.email ) return rx( "Log in First!" );

        let url = tools.ssd + 'purchasedItems';

        NS.Http.request( {
            url: url ,
            method: "POST",
            headers: { "Content-Type": "application/json" },
            content: JSON.stringify( {
                e: store.state.appConfig.email,
                k: tools.key()
            } )
        } )
        .then(

            res => {
                let x = res.content.toJSON() as TS.SSD_Res;
                if ( x.status === 200 ) storage.saveBigKey( x.answer as string );
                else return rx(x)
            },

            e => rx(e)

        )
        .catch( e => rx(e) );

    } );

}


// -- =====================================================================================

export function myRam ( data: string ) {

    return new Promise ( (rs, rx) => { 

        if ( !store.state.appConfig.email ) return rx( "Log in First!" );

        let url = tools.ssd + 'ram';

        NS.Http.request( {
            url: url ,
            method: "POST",
            headers: { "Content-Type": "application/json" },
            content: JSON.stringify( {
                e: store.state.appConfig.email,
                k: tools.key(),
                d: data
            } )
        } )
        .then(

            res => {
                let x = res.content.toJSON() as TS.SSD_Res;
                if ( x.status === 200 ) console.log( x.answer );
                else return rx(x)
            },

            e => rx(e)

        )
        .catch( e => rx(e) );

    } );

}

// -- =====================================================================================
