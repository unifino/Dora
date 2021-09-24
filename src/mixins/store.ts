import Vue                              from 'vue'
import Vuex                             from 'vuex'
import * as TS                          from "@/../types/myTypes"

Vue.use(Vuex);
export default new Vuex.Store( {
    state: {
        scopeIsActive       : false                                 ,
        appConfig           : {} as any                             ,
        darkMode            : true                                  ,
        here                : "Entrance"                            ,
        mode                : "reading"                             ,
        placeTrigger        : {}                                    ,
        mediaState          : "stopped"                             ,
        mediaButtons        : false                                 ,
        needCalculation     : false                                 ,
        downloadingData     : false                                 ,
        massDB              : {}                                    ,
        glssDB              : {}                                    ,
        flssDB              : {}                                    ,
        rbssDB              : {}                                    ,
        activeBox           : {}                                    ,
        sentenceBox         : {}                                    ,
        numberBox           : {}                                    ,
        inHand              : {}                                    ,
        preserve            : {                                      
            selected        : []                                    ,
            flash           : []                                    ,
        }                                                           ,
    } as state,
} ) ;

export interface state {

        windowSize          : {                                      
            width           : number                                ,
            height          : number                                ,
        }                                                           ,
        scopeIsActive       : boolean                               ,
        appConfig           : TS.appConfig                          ,
        darkMode            : boolean                               ,
        here                : TS.here                               ,
        mode                : TS.AppMode                            ,
        placeTrigger        : TS.PlaceTriggerInfo                   ,
        mediaState          : TS.mediaState                         ,
        realCurrentTime     : number                                ,
        mediaButtons        : boolean                               ,
        needCalculation     : boolean                               ,
        downloadingData     : boolean                               ,
        massDB              : { [key: string]: TS.Lesson[]      }   ,
        flssDB              : { [key: string]: TS.Flashcard[]   }   ,
        glssDB              : { [key: string]: TS.Glossar       }   ,
        rbssDB              : { [key: string]: TS.Ribosomes     }   ,
        activeBox           : { [key: string]: TS.VIPSentence[] }   ,
        sentenceBox         : { [key: string]: TS.VIPSentence[] }   ,
        numberBox           : { [key: string]: TS.VIPSentence[] }   ,

        inHand              : {                                      
            // !!!! remove it
            institute       : string                                ,
            lesson          : TS.Lesson                             ,
            mediaPath       : string                                ,
            avatarPath      : string                                ,
        }                                                            

        preserve            : {                                      
            selected        : number[]                              ,
            fakeSelected    : number[]                              ,
            flash           : number[]                              ,
        }                                                           ,
                                                                     
}

// import Vue                              from 'vue';
// import Vuex                             from 'vuex';
// // * npm install direct-vuex
// import { createDirectStore }            from "direct-vuex"
// import mainModule                       from "./storeModule"

// Vue.use(Vuex);

// let { 

//     store, 
//     rootActionContext, 
//     moduleActionContext 

// } = createDirectStore( {

//     modules: {
//         mainModule
//     }

// } );

// export default store
// export { rootActionContext, moduleActionContext }
// export type AppStore = typeof store
// declare module "vuex" {
//     interface Store<S> {
//         direct: AppStore
//     }
// }