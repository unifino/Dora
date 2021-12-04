<template>
<GridLayout
    class="collectionBox"
    rows="10,25,5,*,16"
    columns="12,75,7,*"
    :width=collectionWidth
>

<!---------------------------------------------------------------------------------------->

    <Image row=1 col=1 rowSpan=3 class="avatar" :src="defaultAvatar"  />
    <Image row=1 col=1 rowSpan=3 class="avatar" :src="ribosome.avatar" />

<!---------------------------------------------------------------------------------------->

    <StackLayout row=1 col=3 orientation="horizontal" >
        <Label class="title" :text="ribosome.title" />
        <Label :class="'level ' + ribosome.level" :text="ribosome.level" />
        <Label :class="badge.class" :text="String.fromCharCode( '0x' + badge.icon )" />
    </StackLayout>

<!---------------------------------------------------------------------------------------->

    <ScrollView row=3 col=3 orientation="horizontal" scrollBarIndicatorVisible="false">
        <StackLayout orientation="horizontal" >

            <Lesson 
                v-for="x of inHand" 
                :key="x.chromosome.code.idx" 
                class="Lesson" 
                :lesson="x" 
            />

            <Image
                class="addOne"
                ref="addOne"
                src="res://add_one"
                @tap="addOne()"
                :visibility="allGOT ? 'collapsed' : 'visible'"
            />

        </StackLayout>
    </ScrollView>

<!---------------------------------------------------------------------------------------->

    <StackLayout row=4 col=1 :class="ribosome.contains!=='∞' ? 'progressBox':'pfBox'" >
        <StackLayout
            :width="100 * ( read / Number( ribosome.contains ) ) + '%' "
            horizontalAlignment="left" 
            class="progressBar" 
        />
    </StackLayout>

<!---------------------------------------------------------------------------------------->

</GridLayout>
</template>

// -- =====================================================================================

<script lang="ts">

// -- =====================================================================================

import { Vue, Component, Prop }         from "vue-property-decorator"
import * as NS                          from "@nativescript/core"
import store                            from "@/mixins/store"
import * as genetics                    from "@/mixins/genetics"
import Lesson                           from "@/components/tools/Lesson.vue"

// -- =====================================================================================

@Component ( {
    components: { Lesson }
} )

// -- =====================================================================================

export default class Folder extends Vue {

// -- =====================================================================================

defaultAvatar = "res://dora_default_avatar";
allGOT = false;
read = 0;
collectionWidth = store.state.windowSize.width > 500 ? 309 : "100%";

// -- =====================================================================================

@Prop() ins: string;
@Prop() code: string;

// -- =====================================================================================

get ribosome () {

    let rbssDB = store.state.rbssDB[ this.ins ];
    return Object.values( rbssDB ).find( x => x.code === this.code );

}

// -- =====================================================================================

get badge () {

    let icon = null,
        className = "badge fas ";

    if ( this.ribosome.type === "audio" ) { icon = "f58f"; className += "audio"; }
    if ( this.ribosome.type === "video" ) { icon = "f008"; className += "video"; }
    // if ( this.ribosome.type === "comic" ) { icon = "f302"; className += "image"; }
    if ( this.ribosome.type === "mixed" ) { icon = "f302"; className += "mixed"; }

    return { icon: icon, class: className }

}

// -- =====================================================================================

get inHand () {

    let inHands = [],
        inLocal = 0;

    // .. reset counter
    this.read = 0;

    // .. convert lessonBox to List
    for ( let x of Object.values( store.state.massDB[ this.ins ] ) )
        if ( x.chromosome.code.ribosome === this.ribosome.code ) {
            inLocal++;
            if ( x.chromosome.status === "reading" ) inHands.push( x );
            else this.read++;
        }

    // .. determine if all Lessons has been Downloaded already!
    if ( inLocal === this.ribosome.contains ) this.allGOT = true;

    return inHands;

}

// -- =====================================================================================

addOne () {
    this.tapAnimator().then( () => genetics.retrieving_cell( this.ribosome ) );
}

// -- =====================================================================================

tapAnimation: NS.Animation;
tapAnimator (): Promise<void> {

    return new Promise ( (rs, rx) => { 
        let x_def: NS.AnimationDefinition = {};

        x_def.scale = { x: 1.04, y: 1.04 };
        x_def.curve = NS.Enums.AnimationCurve.ease;
        x_def.duration = 80;

        x_def.target = ( this.$refs.addOne as any ).nativeView;

        this.tapAnimation = new NS.Animation( [ x_def ], false );
        this.tapAnimation.play().then( () => { 
            x_def.scale = { x: 1, y: 1 };
            this.tapAnimation = new NS.Animation( [ x_def ], false );
            this.tapAnimation.play().then( () => rs() );
        } );
    } );

}

// -- =====================================================================================

}

// -- =====================================================================================

</script>

// -- =====================================================================================

<style scoped>

/*                                          */

    .collectionBox {
        border-radius: 5;
        height: 120;
        margin: 3;
    }
    .light .collectionBox { background-color: rgba(44, 44, 44, 0.04) }
    .dark  .collectionBox { background-color: rgba(44, 44, 44, 0.13) }

    .avatar {
        border-radius: 7;
        android-elevation: 5;
        stretch: aspectFill;
    }

    .title, .level {
        background-color: #676d6d;
        color: #fcf9f6;
        font-family: Raleway-Regular;
        font-size: 12;
        font-weight: bold;
        padding: 5 9;
        margin-right: 3;
        border-radius: 4;
        horizontal-align: left;
    }

    .level { padding: 5 5 }
    .A1 { background-color: #5fb102 }
    .A2 { background-color: #0d8a1d }
    .B1 { background-color: #026bb1 }
    .B2 { background-color: #083983 }
    .C1 { background-color: #8b0575 }
    .C2 { background-color: #970707 }

    .addOne {
        background-color: #094e63;
        border-width: 0.5;
        border-color: #094e63;
        border-radius: 2 6 6 2;
        width: 55;
        horizontal-align: left;
        stretch: aspectFit
    }

    .badge {
        font-size: 14;
        height: 25;
        width: 20;
        text-align: center;
        vertical-align: middle;
    }

    .audio {
        color: #0a5d83;
        padding-top: 4;
    }

    .video {
        font-size: 18;
        color: #2b0138;
        padding-top: 2;
        width: 23;
    }

    /* .image {
        color: #219205;
        font-size: 17;
        padding-top: 4;
    } */

    .mixed {
        color: #219205;
        font-size: 17;
        padding-top: 4;
    }

    .progressBox, .pfBox {
        height: 4;
        margin: 0 1;
        border-radius: 5;
        background-color: cornsilk;
    }

    .pfBox { 
        background-color: #7a7d7e;
    }

    .progressBar {
        background-color: #fa4829;
        border-radius: 5;
        height: 4;
    }

</style>
