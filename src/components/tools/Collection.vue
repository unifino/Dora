<template>
<GridLayout columns="12,75,7,*" rows="10,25,5,*,10" class="collectionBox">

<!---------------------------------------------------------------------------------------->

    <Image col=1 row=1 rowSpan=3 class="avatar" :src="defaultAvatar"  />
    <Image col=1 row=1 rowSpan=3 class="avatar" :src="ribosome.avatar" />

<!---------------------------------------------------------------------------------------->

    <StackLayout col=3 row=1 orientation="horizontal" >
        <Label class="title" :text="ribosome.title" />
        <Label :class="badged.class" :text="String.fromCharCode( '0x' + badged.icon )" />
    </StackLayout>

<!---------------------------------------------------------------------------------------->

    <ScrollView col=3 row=3 orientation="horizontal" scrollBarIndicatorVisible="false">
        <StackLayout orientation="horizontal" >
            <Lesson v-for="(x,i) of inHand" :key="i" class="Lesson" :lesson="x" />
            <Image class="addOne" src="res://add_one" @tap="addOne()" ref="addOne" />
        </StackLayout>
    </ScrollView>

<!---------------------------------------------------------------------------------------->

</GridLayout>
</template>

// -- =====================================================================================

<script lang="ts">

// -- =====================================================================================

import { Vue, Component, Prop }         from "vue-property-decorator"
import * as NS                          from "@nativescript/core"
import * as TS                          from "@/../types/myTypes"
import store                            from "@/mixins/store"
import * as storage                     from "@/mixins/storageHandler"
import * as tools                       from "@/mixins/tools"
import * as genetics                    from "@/mixins/genetics"
import * as shopping                    from "@/mixins/shopping"
import Lesson                           from "@/components/tools/Lesson.vue"
import ClassRoom                        from "@/components/ClassRoom/ClassRoom.vue"
import Bus                              from "@/mixins/bus"
import nButton                          from "@/components/tools/n_Button.vue"

// -- =====================================================================================

@Component ( {
    components: { Lesson }
} )

// -- =====================================================================================

export default class Folder extends Vue {

// -- =====================================================================================

defaultAvatar = "res://dora_default_avatar";

// -- =====================================================================================

@Prop() ins: string;
@Prop() code: string;

// -- =====================================================================================

get ribosome () {

    let rbssDB = store.state.rbssDB[ this.ins ];
    return Object.values( rbssDB ).find( x => x.code === this.code );

}

// -- =====================================================================================

get badged () {

    let icon = null,
        className = "badged fas ";

    if ( this.ribosome.type === "audio" ) { icon = "f58f"; className += "audio"; }
    if ( this.ribosome.type === "video" ) { icon = "f008"; className += "video"; }
    if ( this.ribosome.type === "slide" ) { icon = "f43c"; className += "slide"; }
    if ( this.ribosome.type === "comic" ) { icon = "f302"; className += "image"; }

    return { icon: icon, class: className }

}

// -- =====================================================================================

get inHand () {

    let inHands = [];

    // .. convert lessonBox to List
    for ( let x of Object.values( store.state.massDB[ this.ins ] ) )
        if ( x.chromosome.code.ribosome === this.ribosome.code )
            if ( x.chromosome.status === "reading" )
                inHands.push( x );

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
        background-color: rgba(44, 44, 44, 0.02);
        height: 114;
    }

    .avatar {
        border-radius: 7;
        android-elevation: 5;
        stretch: aspectFill
    }

    .title {
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

    .addOne {
        background-color: #f1f1f1;
        border-width: 1;
        border-color: #094e63;
        border-radius: 5;
        width: 55;
        horizontal-align: left;
        stretch: aspectFill
    }

    .badged {
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
        color: #867904;
        padding-top: 2;
        width: 23;
    }

    .slide {
        color: #d30606;
        padding-top: 4;
    }

    .image {
        color: #219205;
        font-size: 17;
        padding-top: 4;
    }

</style>
