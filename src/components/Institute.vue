<template>
<Page class="fx" @navigatedTo="$store.state.here='Institute'" >
<GridLayout ref="wall" >

<!---------------------------------------------------------------------------------------->

    <ScrollView 
        ref="myBigBox"
        class="myBigBox"
        verticalAlignment="middle"
        @swipe="swipePass=true"
        scrollBarIndicatorVisible="false"
    >

        <StackLayout padding="85% 0 330% 0">

            <ScrollView v-for="(code,i) of rbssCodes" :key="i" @swipe="swipePass=true">

                <StackLayout class="collectionBox">

                    <Collection horizontalAlignment="left" :code="code" :ins="ins" />

                    <StackLayout v-if="i<rbssCodes.length-1" class="divider" />

                </StackLayout>

            </ScrollView>

        </StackLayout>

    </ScrollView>

<!---------------------------------------------------------------------------------------->

</GridLayout>
</Page>
</template>

// -- =====================================================================================

<script lang="ts">

// -- =====================================================================================

import { Vue, Component, Prop }         from "vue-property-decorator"
import store                            from "@/mixins/store"
import Collection                       from "@/components/tools/Collection.vue"
import * as tools                       from "@/mixins/tools"
import * as storage                     from "@/mixins/storageHandler"
import * as genetics                    from "@/mixins/genetics"
import Bus                              from "@/mixins/bus"
// * npm i nativescript-exit
import { exit }                         from "nativescript-exit";
import * as shopping                    from "@/mixins/shopping"

// -- =====================================================================================

@Component( { 
    components: { Collection }
} )

// -- =====================================================================================

export default class Institute extends Vue {

// -- =====================================================================================

@Prop() ins!: string;

// -- =====================================================================================

// TODO what is this?
swipePass: boolean;
rbssCodes: string[] = [];

// -- =====================================================================================

mounted () {

    store.state.mode = "idle";
    store.state.appConfig.instituteBookmark = this.ins;

    tools.dAO( this.ins );
    tools.glssDBUpdater( this.ins );

    // .. check if we have some data from server
    if ( Object.keys( store.state.rbssDB[ this.ins ] ).length ) this.collector();

    // .. update data
    genetics.ribosomesOnServer( this.ins ).then( () => this.collector() );

    Bus.$off( "Institute_BackOrExit" )
    Bus.$on( "Institute_BackOrExit", this.backOrExit );

}

// -- =====================================================================================

collector () {

    let codes: string[] = [];

    // .. reset collections list
    this.rbssCodes = [];

    // .. convert ribosomes to List
    for ( let x of Object.values( store.state.rbssDB[ this.ins ] ) ) codes.push( x.code );

    // .. remove Duplicates
    codes = [ ...new Set( codes ) ];

    // .. register codes
    this.rbssCodes = codes;

}

// -- =====================================================================================

backOrExit () {

    // .. shopping mode
    if      ( store.state.mode === "shopping" ) shopping.backOrExitShop( this.ins );
    // .. setting mode
    else if ( store.state.mode === "setting"  ) Bus.$emit( "Menu_ToggleMenu" );
    // .. exit
    else {

        Bus.$emit( "Welcome_Slide", true );

        setTimeout( () => {

            let saveActions = [
                storage.saveMass(),
                storage.saveGlossar(),
                storage.saveRibosomes(),
                storage.saveFlashCards(),
                storage.saveAppConfig(),
            ];

            Promise.all( saveActions )
            .then( () => exit() )
            .catch( err => { 
                tools.toaster( err, "long" );
                exit();
            } );

        }, 700 );

    };

}

// -- =====================================================================================

}

// -- =====================================================================================

</script>

// -- =====================================================================================

<style scoped>

/*                                          */

    .myBigBox {
        height: 100%;
    }

    .collectionBox {
        margin: 1 0;
        padding: 0;
        width: 100%;
    }

    .divider {
        height: 1;
        width: 97%;
        background-color: #6638393d;
        margin: 0;
        padding: 0;
    }

</style>




