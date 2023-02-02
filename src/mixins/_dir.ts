import * as TS                          from "@/../types/myTypes"
import store                            from "@/mixins/store"

// -- =====================================================================================

export function _divider (): TS.FolderProperty {
    return {
        type        : "divider",
        path        : [],
    } as TS.FolderProperty
}

// -- =====================================================================================

export function 
_category ( ins: string, type: TS.LessonType ): TS.FolderProperty {

    let icon: string, 
        label: string;

    switch (type) {
        case "audio": icon = "f58f"; label = "Audio";       break;
        case "video": icon = "f008"; label = "Video";       break;
        case "mixed": icon = "f06c"; label = "Mixed";       break;
        // case "comic": icon = "f03e"; label = "Comics";      break;
        // case "plain": icon = "f06c"; label = "Lilliputy";   break;
    }

    return { 
        title       : label,
        type        : 'category',
        icon        : icon, 
        path        : [ type ],
        institute   : ins,
    } as TS.FolderProperty

}

// -- =====================================================================================

export function _up ( ins: string ): TS.FolderProperty { 
    return { 
        title       : '..', 
        icon        : 'f137', 
        type        : 'special',
        path        : [],
        // [ ...store.state.inHand.path[ ins ], '..' ],
        institute   : ins,
    }
}

// -- =====================================================================================

export function _archive ( ins: string ): TS.FolderProperty { 
    return { 
        title       : 'Archive', 
        icon        : 'f187', 
        type        : 'special',
        path        : [ 'Archive' ],
        institute   : ins,
    }
}

// -- =====================================================================================

// export function _shop ( ins: string ): TS.FolderProperty {

//     let icon = store.state.shopDB[ ins ] ? "f54e" : "f141";

//     return { 
//         title       : "Store",
//         icon        : icon, 
//         type        : "shop",
//         path        : [],
//         institute   : ins,
//     }

// }

// -- =====================================================================================

export function _ordinary ( ins: string, item: string ): TS.FolderProperty {
    return { 
        title       : item, 
        icon        : "",
        type        : "ordinary",
        path        : [],
        // path        : [ ...store.state.inHand.path[ ins ], item ],
        institute   : ins,
        ...lessonBinder( ins, item )
    }
}

// -- =====================================================================================

export function _ribosome ( ins: string, ribosome: TS.Ribosome ): TS.FolderProperty {
    
    let icon = ribosome.code;

    if ( store.state.mode === "shopping" ) {
        let box = store.state.rbssDB[ ribosome.institute ];
        if ( box.hasOwnProperty( ribosome.code ) ) icon = "f02e";
    }

    return {
        title       : ribosome.title, 
        icon        : icon, 
        type        : "shopItem",
        path        : [ ribosome.title ],
        institute   : ins,
        ribosome    : ribosome,
    }

}

// -- =====================================================================================

function lessonBinder ( ins: string, title: string ) {
    
    let pTest
    //  = [ ...store.state.inHand.path[ ins ], title ] ;

    // .. determine folder Type
    let id = Object.values( store.state.massDB[ ins ] ).findIndex( x => 
        x.chromosome.vPath.length === pTest.length && 
        x.chromosome.vPath.every( (p, i) => p === pTest[i] ) 
    );

    return id > -1 ? {
        lessonId : id,
        lesson   : store.state.massDB[ ins ][ id ],
    } : {};

}

// -- =====================================================================================
