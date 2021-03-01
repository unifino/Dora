export function x007 ( str: string, key: string|false = false, decode=false ) {

    if ( !key ) return decode ? _d( str ) : _c( str );

    function _c ( str: string ): string {
        return Buffer.from( str, "utf8" ).toString( 'base64' ).replace( /\=/g, "" );
    }

    function _d ( str: string ): string {
        return Buffer.from( str, "base64" ).toString( 'utf8' );
    }

    function _m ( str: string, x: string, y: string ) {
        return str = str.
            replace( new RegExp( x, "g" ), '=' ).
            replace( new RegExp( y, "g" ), x ).
            replace( /\=/g, y );
    }

    function _x ( str: string ): string {
        str = _m( str, "z", "Z" );
        str = _m( str, "6", "9" );
        str = _m( str, "n", "u" );
        str = _m( str, "b", "d" );
        str = _m( str, "p", "q" );
        return str;
    }

    return !decode ?
        _x( _c( _c( key ) + _c( str ) ) ) :
        _d( _d( _x( str ) ).replace( _c( key ), "" ) )
        ;

}

// declare const android: any;
// declare const java: any;

// let flagA = android.util.Base64.NO_WRAP | android.util.Base64.NO_PADDING;
// let flagB = java.nio.charset.StandardCharsets.UTF_8;

// export function strToB64( str: string ) {
//     const text = new java.lang.String( str );
//     const data = text.getBytes( "UTF-8" );
//     const base64String = android.util.Base64.encodeToString( data, flagA );
//     return base64String as string;
// }

// export function b64ToStr( b64: string ) {
//     let data = android.util.Base64.decode( b64, flagA );
//     let decodedString = new java.lang.String( data, flagB );
//     return decodedString as string;
// }