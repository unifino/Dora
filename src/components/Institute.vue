<template>
<Page class="fx" @navigatedTo="$store.state.here='Institute'" >
<GridLayout>

<!---------------------------------------------------------------------------------------->

    <ScrollView
        ref="myBigBox"
        class="myBigBox"
        verticalAlignment="middle"
        @swipe="swipePass=true"
        scrollBarIndicatorVisible="false"
    >

        <WrapLayout ref="myBigRail" padding="48% 0 330% 0">

            <StackLayout v-for="code of rbssCodes" :key="code" @swipe="swipePass=true">

                <Collection class="collection" :code="code" :ins="ins" />

            </StackLayout>

        </WrapLayout>

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
import Dictionary                       from "@/components/Menu/Dictionary.vue"
import MenuPanel                        from "@/components/Menu/Panel.vue"
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
pokAll = false;

// -- =====================================================================================

mounted () {

    store.state.mode = "idle";
    store.state.appConfig.instituteBookmark = this.ins;

    tools.dAO( this.ins );

    // .. update Glossar
    let menuPanel = this.$parent.$parent.$refs.menuPanel as MenuPanel;
    let Dictionary = menuPanel.$refs.Dictionary as Dictionary;
    Dictionary.init( this.ins );

    // .. check if we have some data from server
    if ( Object.keys( store.state.rbssDB[ this.ins ] ).length ) this.collector();

    // .. update data
    genetics.ribosomesOnServer( this.ins ).then( () => this.collector() );

    Bus.$off( "Institute_BackOrExit" );
    Bus.$on( "Institute_BackOrExit", this.backOrExit );

    // .. adjust paddingTop of myBigRail
    ( this.$refs.myBigRail as any ).nativeView.horizontalAlignment =
        store.state.windowSize.width > 500 ? "center" : "left";

}

// -- =====================================================================================

collector () {

    let codes: string[] = [];

    // .. reset collections list
    this.rbssCodes = [];

    // .. convert ribosomes to List
    for ( const x of Object.values( store.state.rbssDB[ this.ins ] ) ) {

        let pok = false;

        // .. it will be presented due to the infinity lessons that contains
        if ( x.contains === "∞" ) pok = true;
        else {

            const massDB = Object.values( store.state.massDB[ this.ins ] ),
                lessons = massDB.filter( z => z.chromosome.code.ribosome === x.code );

            // .. it will be presented because all the lessons haven't been downloaded yet
            if ( lessons.length < x.contains ) pok = true;
            // .. it will be presented because some lessons haven't been read yet
            else if ( lessons.some( z => z.chromosome.status === "reading" ) ) pok = true;
            // .. it will be presented due to the user perforation
            if ( this.pokAll ) pok = true;

        }

        if ( pok ) codes.push( x.code );

    }

    // .. remove Duplicates
    codes = [ ...new Set( codes ) ];

    // .. register codes
    this.rbssCodes = codes;

}

// -- =====================================================================================

backOrExit () {

    // .. shopping mode
    if ( store.state.mode === "shopping" ) shopping.backOrExitShop( this.ins );
    // .. setting mode
    else if ( store.state.mode === "setting"  ) Bus.$emit( "Panel_ToggleExpansion" );
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
    .myBigBox { height: 100% }

</style>




