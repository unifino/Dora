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

export function myRam ( action: TS.RamActions ): Promise<string> {

    // .. touch data
    let data = "";

    // .. provide actual data
    if ( action === "upload" ) {

        // .. zip all important data to transfer
        let z_data = {
            mass: store.state.massDB,
            flss: store.state.flssDB,
            glss: store.state.glssDB,
        }
        data = Buffer.from( JSON.stringify( z_data ), 'utf-8' ).toString( 'base64' );

        // .. notify uploading data size
        tools.toaster( ( ( data.length /1024 ) | 0 ) + " KB" );

    }

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
                d: data,
                a: action
            } )
        } )
        .then(

            res => {
                try {
                    let x = res.content.toJSON() as TS.SSD_Res;
                    if ( x.status === 200 ) rs( x.answer );
                    else return rx( x.reason )
                } catch (e) { rx( res.content.toString() ) }
            },

            e => rx(e)

        )
        .catch( e => rx(e) );

    } );

}

// -- =====================================================================================

export function _ram ( ram: string ) {

    try {

        // .. notify received data size
        tools.toaster( ( ( ram.length /1024 ) | 0 ) + " KB" );

        let z_data:{
            mass: { [key: string]: TS.Lesson[] },
            flss: { [key: string]: TS.Flashcard[] },
            glss: { [key: string]: TS.Glossar }
        } = JSON.parse( Buffer.from( ram, 'base64' ).toString('utf-8') );

        // .. chcek integrity of zip data
        if ( z_data.mass && z_data.flss && z_data.glss ) {
            store.state.flssDB = z_data.flss;
            store.state.glssDB = z_data.glss;
            store.state.massDB = z_data.mass;
            return 1;
        }

        // .. data is not met zip-data structure
        else return 0;

    }
    catch (e) { return 0; }

}

// -- =====================================================================================
