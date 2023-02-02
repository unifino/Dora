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
        // .. get actual zipped data
        data = tools.zip();
        // .. no need to update | return back
        if ( data.length < 140 ) return Promise.reject( "All DATA synced already!" );
        // .. notify uploading data size
        else tools.toaster( ( ( data.length /1024 ) | 0 ) + " KB" );
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

        let zip: TS.zip = JSON.parse( Buffer.from( ram, 'base64' ).toString('utf-8') );

        // .. chcek integrity of zip data
        if ( zip.mass && zip.flss && zip.glss ) {
            // .. implanting them ...
            return tools.unzip_scatter( zip );
        }

        // .. data is not met zip-data structure
        else return 0;

    }
    catch (e) { return 0; }

}

// -- =====================================================================================
