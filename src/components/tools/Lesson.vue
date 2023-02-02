<template>
<GridLayout ref="lessonBox" @tap="lessonTapped()" @longPress="lessonLongPressed">

<!---------------------------------------------------------------------------------------->

    <Label class="background" :text="'#' + ( Number( lesson.chromosome.code.idx ) +1 )" />
    <Image class="avatar" :src="avatar" />

<!---------------------------------------------------------------------------------------->

    <GridLayout class="managingBox" ref="managingBox">
        <nButton 
            myClass="fas deleteButton"
            :myLabel="String.fromCharCode( '0x' + 'f2ed' )"
            @tap="deleteMe"
        />
    </GridLayout>

<!---------------------------------------------------------------------------------------->

</GridLayout>
</template>

// -- =====================================================================================

<script lang="ts">

// -- =====================================================================================

// * npm i --save vue-class-component vue-property-decorator
import { Vue, Component, Prop }         from "vue-property-decorator"
import * as NS                          from "@nativescript/core"
import * as TS                          from "@/../types/myTypes"
import store                            from "@/mixins/store"
import * as tools                       from "@/mixins/tools"
import * as storage                     from "@/mixins/storageHandler"
import ClassRoom                        from "@/components/ClassRoom/ClassRoom.vue"
import Bus                              from "@/mixins/bus"
import nButton                          from "@/components/tools/n_Button.vue"
import Collection                       from "@/components/tools/Collection.vue"

// -- =====================================================================================

@Component ( {
    components: { nButton }
} )

// -- =====================================================================================

export default class template extends Vue {

// -- =====================================================================================

actPermission = true;

// -- =====================================================================================

@Prop() lesson: TS.Lesson;

// -- =====================================================================================

get avatar () {

    let avatar: string;
    let org: TS.Organelle;

    // .. find dAvatar
    try { org = this.lesson.protoplasm.find( x => x.type === "dAvatar" ) } catch {}
    // .. online avatar
    try { avatar = org.sourceURL } catch {}
    // .. local avatar
    try { avatar = NS.path.join( storage.baseFolder.path, org.address ) } catch {}

    return avatar;

}

// -- =====================================================================================

lessonTapped () {
    // .. do nothing
    if ( !this.actPermission ) return;
    // .. perform Animation and then Open the Lesson
    this.tapAnimator().then( () => this.openLesson() );
}

// -- =====================================================================================

tapAnimation: NS.Animation;
tapAnimator (): Promise<void> {

    return new Promise ( (rs, rx) => { 
        let x_def: NS.AnimationDefinition = {};

        x_def.scale = { x: 1.04, y: 1.04 };
        x_def.curve = NS.Enums.AnimationCurve.ease;
        x_def.duration = 80;

        x_def.target = ( this.$refs.lessonBox as any ).nativeView;

        this.tapAnimation = new NS.Animation( [ x_def ], false );
        this.tapAnimation.play().then( () => { 
            x_def.scale = { x: 1, y: 1 };
            this.tapAnimation = new NS.Animation( [ x_def ], false );
            this.tapAnimation.play().then( () => rs() );
        } );
    } );

}


// -- =====================================================================================

managingBox_animation: NS.Animation;
lessonLongPressed () {

    if ( this.managingBox_animation ) this.managingBox_animation.cancel();
    if ( !this.$refs.managingBox ) return 0;

    // .. lock actPermission
    this.actPermission = false;

    let x_def: NS.AnimationDefinition = {},
        managingBox = ( this.$refs.managingBox as any ).nativeView;

    managingBox.visibility = "visible";

    x_def.target   = managingBox;
    x_def.duration = 200;
    x_def.scale    = { x: 1, y: 1 };
    x_def.delay    = 0;

    this.managingBox_animation = new NS.Animation( [ x_def ], false );
    this.managingBox_animation.play().then( () => { 
        x_def.scale = { x: 0, y: 0 };
        x_def.delay = 3000;
        this.managingBox_animation = new NS.Animation( [ x_def ], false );
        this.managingBox_animation.play().then( () => {
            managingBox.visibility = "hidden";
            this.actPermission = true;
        } );
    } );

}

// -- =====================================================================================

deleteMe () {

    if ( !this.lesson ) return 0;

    // .. perform Animation
    this.folderOut().then( () => { 

        let ins = store.state.inHand.institute,
            lessonId: number;

        // ! may I determine it before?
        lessonId = store.state.massDB[ ins ].findIndex( x => 
            ( x.chromosome.code.ribosome === this.lesson.chromosome.code.ribosome ) && 
            ( x.chromosome.code.idx === this.lesson.chromosome.code.idx )
        )

        // .. try to remove Materials
        try {
            this.lesson.protoplasm.forEach( org => {
                if ( org.address ) {
                    let path = NS.path.join( storage.baseFolder.path, org.address )
                    NS.File.fromPath( path ).removeSync();
                }
            } );
        } catch {}

        // .. purge the Lesson
        store.state.massDB[ ins ].splice( lessonId, 1 );

        // .. recalculate Brain
        tools.dAO( store.state.inHand.institute );

        // .. reappear the AddOne Button
        ( this.$parent as Collection ).allGOT = false;

    } );

}


// -- =====================================================================================

folder_animation: NS.Animation;
folderOut (): Promise<void> {

    return new Promise ( rs => { 

        this.actPermission = false;

        if ( this.folder_animation ) this.folder_animation.cancel();

        let x_def: NS.AnimationDefinition = {};

        x_def.target   = ( this.$refs.lessonBox as any ).nativeView;
        x_def.duration = 100;
        x_def.scale    = { x: 1.1, y: 1.1 };

        this.folder_animation = new NS.Animation( [ x_def ], false );
        this.folder_animation.play().then( () => { 
            x_def.scale = { x: 0, y: 0 };
            x_def.duration = 200;
            this.folder_animation = new NS.Animation( [ x_def ], false );
            this.folder_animation.play().then( () => {
                x_def.width = 1;
                this.folder_animation = new NS.Animation( [ x_def ], false );
                this.folder_animation.play().then( () => rs() );
            } );
        } );

    } );

}

// -- =====================================================================================

openLesson () {

    store.state.mode = "traveling";

    this.coordinator( "Class" );

    // .. close scope then go to ClassRoom
    let delay = 0;
    if ( store.state.scopeIsActive ) {
        Bus.$emit( "Scope_DeskCtl", "down" );
        delay = 300;
    }

    store.state.inHand.lesson = this.lesson;
    setTimeout( () => this.headToClassRoom( ClassRoom ), delay );

}

// -- =====================================================================================

coordinator ( place: TS.Place ) {

    let origin = ( this.$refs.lessonBox as any ).nativeView;

    store.state.placeTrigger[ place ]  = {
        position: origin.getLocationInWindow(),
        size: origin.getActualSize()
    } 

}

// -- =====================================================================================

headToClassRoom ( ClassRoom ) {

    Vue.prototype.$navigateTo( ClassRoom, {
        frame : 'room' ,
        backstackVisible : true ,
    } )

}

// -- =====================================================================================

beforeDestroy () {}

// -- =====================================================================================

destroyed () {}

// -- =====================================================================================

}

// -- =====================================================================================

</script>

// -- =====================================================================================

<style scoped>

/*                                          */

    .background {
        background-color: #f1f1f1;
        border-width: 1.7 1.7 1.7 5.3;
        border-color: #094e63;
        border-radius: 2 6 6 2;        width: 55;
        margin-right: 3;
        text-align: center;
        font-size: 25;
        font-family: Farsan-Regular;
        padding-top: 13;
    }

    .avatar {
        border-width: 1.7 1.7 1.7 3.5;
        border-color: #094e63;
        border-radius: 2 6 6 2;
        width: 55;
        margin-right: 3;
        horizontal-align: left;
        stretch: aspectFill
    }

    .managingBox {
        background-color: rgba(26, 27, 27, .9);
        border-radius: 5;
        transform: scale(0,0);
        height: 100%;
        width: 56;
        visibility: hidden;
        vertical-align: middle;
    }

    .deleteButton {
        font-size: 30;
        color: red;
    }

</style>