<template>
<GridLayout ref="lessonBox" @tap="lessonTapped()">

<!---------------------------------------------------------------------------------------->

    <Image col=1 row=1 rowSpan=2 class="avatar" :src="avatar"  />

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

// -- =====================================================================================

@Component ( { 
    components: { } 
} )

// -- =====================================================================================

export default class template extends Vue {

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

    .avatar {
        background-color: #f1f1f1;
        border-width: 1;
        border-color: #094e63;
        border-radius: 5;
        width: 55;
        margin-right: 3;
        horizontal-align: left;
        stretch: aspectFill
    }

</style>