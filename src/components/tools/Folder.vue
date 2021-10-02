<template>
<GridLayout
    ref="myFolder"
    :class="myClass"
    :backgroundImage="myAvatar" 
    @tap="tapAction"
    @longPress="longPressAction"
>

<!---------------------------------------------------------------------------------------->

    <Label 
        :class="myIcon.class"
        :text="String.fromCharCode( '0x' + myIcon.icon )" 
        :fontSize="myIcon.size"
    />

<!---------------------------------------------------------------------------------------->

    <Label 
        :class="myLabelClass"
        :text="myProp.title === '..' ? '' : myProp.title" 
    />

<!---------------------------------------------------------------------------------------->

    <stackLayout class="managingBox" ref="managingBox" >
        <nButton 
            myClass="fas deleteButton"
            :myLabel="String.fromCharCode( '0x' + 'f2ed' )"
            @tap="deleteMe"
        />
    </stackLayout>

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
import ClassRoom                        from "@/components/ClassRoom/ClassRoom.vue"
import Bus                              from "@/mixins/bus"
import nButton                          from "@/components/tools/n_Button.vue"
import Scope                            from "@/components/Scope/Scope.vue"

// -- =====================================================================================

@Component ( {
    components: { nButton }
} )

// -- =====================================================================================

export default class Folder extends Vue {

// -- =====================================================================================

actPermission = true;

// -- =====================================================================================

@Prop() myProp: TS.FolderProperty;
@Prop() hidden: boolean;

// -- =====================================================================================

get myIcon () {

    let icon = { 
        icon: this.myProp.icon, 
        size: 44, 
        class: "fas icon" 
    };

    if ( this.myProp.icon === 'f167' ) icon.class = "fab icon";
    if ( this.myProp.icon === 'f06c' ) icon.size = 36;
    if ( this.myProp.title === ".." ) icon.size = 38;
    if ( this.myProp.type === "shortLink" ) { 
        icon.icon = "f064"; 
        icon.size = 20
    };

    return icon;

}

// -- =====================================================================================

get myClass () {

    let myClass = "folder ";

    switch ( true ) {
        case !this.myProp                     : myClass =  "";          break;
        case this.myProp.type === 'shortLink' : myClass =  "shortLink"; break;
        case this.myProp.type === 'divider'   : myClass =  "divider";   break;
        case this.myProp.type === 'shop'      : myClass += "shop";      break;
        case this.myProp.type === 'shopItem'  : myClass += "shopItem";  break;
        case this.myProp.type === 'category'  : myClass += "category";  break;

        default: myClass += this.myProp.type + 'Folder';                break;
    }

    return myClass;

}

// -- =====================================================================================

get myLabelClass () {
    if      ( this.myProp.type === 'ordinary' ) return 'line_label';
    else if ( this.myProp.type === 'shopItem' ) return 'middle_label';
    else                                        return 'big_label';
}

// -- =====================================================================================

get myAvatar () {

    if ( this.myProp.type === "shortLink" ) return null;

    let avatar: string;
    let org: TS.Organelle;

    try { org = this.myProp.lesson.protoplasm.find( x => x.type === "dAvatar" ) } catch {}
    try { avatar = this.myProp.ribosome.avatar } catch {}
    try { avatar = org.sourceURL } catch {}
    try { avatar = NS.path.join( storage.baseFolder.path, org.address ) } catch {}

    return avatar;

}

// -- =====================================================================================

tapAction () {

    // .. do nothing
    if ( !this.actPermission ) return;
    if ( store.state.here === "IPanel" ) return;
    if ( this.myProp.type === "divider" ) return;
    if ( store.state.mode === "traveling" ) return;
    if ( store.state.mode !== "idle" && store.state.mode !== "shopping" ) return;

    // .. lock tap permission
    this.actPermission = false;

    // .. action
    this.tapAnimator().then( () => {

        // .. release tap permission
        setTimeout( () => this.actPermission = true, 300 );

        // .. (in) shop
        if ( this.myProp.type === "shop" || this.myProp.type === "category" )
            shopping.inShop( this.myProp.institute, this.myProp.title, this.myProp.path );

        else {
            // .. Lesson
            if ( this.myProp.lesson ) this.openLesson();
            // .. Ribosome
            else if ( this.myProp.ribosome ) this.onRibosome();
            // .. Folder|Back
            else this.openFolder();
        }

    } );

}

// -- =====================================================================================

onRibosome () {

    if ( store.state.mode === "idle" ) genetics.retrieving_cell( this.myProp.ribosome );

    if ( store.state.mode === "shopping" ) {
        let box = store.state.rbssDB[ store.state.inHand.institute ];
        // .. mark as added!
        if ( !box.hasOwnProperty( this.myProp.ribosome.code ) ) {
            this.myProp.icon = "f02e";
            // genetics.copyingRibosome( this.myProp.ribosome );
        }
        // .. mark as not Added
        else {
            this.myProp.icon = "";
            // genetics.removeRibosome( this.myProp.ribosome );
        }
    }

}

// -- =====================================================================================

tapAnimation: NS.Animation;
tapAnimator (): Promise<void> {

    return new Promise ( (rs, rx) => { 
        let x_def: NS.AnimationDefinition = {};

        x_def.scale = { x: 1.04, y: 1.04 };
        x_def.curve = NS.Enums.AnimationCurve.ease;
        x_def.duration = 80;

        x_def.target = ( this.$refs.myFolder as any ).nativeView;

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
longPressAction () {

    if ( this.managingBox_animation ) this.managingBox_animation.cancel();

    if ( store.state.mode === "idle" ) {

        if ( this.myProp.type === "ordinary" || this.myProp.type === "shopItem" ) {

            if ( this.myProp.lesson || this.myProp.ribosome ) {

                this.actPermission = false;

                if ( !this.$refs.managingBox ) return 0;

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

        }

    }

}

// -- =====================================================================================

openFolder () {

    let path;
    // .. back-Folder has been Tapped
    if ( this.myProp.title === ".." ) path.pop();
    // .. register current path
    else path.push( this.myProp.title );

    // .. Generate new Folder-List ()
    if ( store.state.mode === "shopping" ) {
        // ! do we need this?!
        if ( path.length ) return;
        else store.state.mode = "idle";
    }

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

    store.state.inHand.lesson = this.myProp.lesson;
    setTimeout( () => this.headToClassRoom( ClassRoom ), delay );

}

// -- =====================================================================================

deleteMe () {

    if ( store.state.mode !== "idle" ) return 0;

    this.folderOut();

    let ins = store.state.inHand.institute;

    if ( this.myProp.lesson ) {

        try {
            this.myProp.lesson.protoplasm.forEach( org => {
                if ( org.address ) {
                    let path = NS.path.join( storage.baseFolder.path, org.address )
                    NS.File.fromPath( path ).removeSync();
                }
            } );
        } catch {}

        store.state.massDB[ ins ].splice( this.myProp.lessonId, 1 );

        tools.dAO( store.state.inHand.institute );

    }

    // if ( this.myProp.ribosome ) genetics.removeRibosome( this.myProp.ribosome );

}

// -- =====================================================================================

folder_animation: NS.Animation;
folderOut () {

    this.actPermission = false;

    if ( this.folder_animation ) this.folder_animation.cancel();

    let x_def: NS.AnimationDefinition = {};

    x_def.target   = ( this.$refs.myFolder as any ).nativeView;
    x_def.duration = 100;
    x_def.scale    = { x: 1.1, y: 1.1 };

    this.folder_animation = new NS.Animation( [ x_def ], false );
    this.folder_animation.play().then( () => { 
        x_def.scale = { x: 0, y: 0 };
        x_def.duration = 200;
        this.folder_animation = new NS.Animation( [ x_def ], false );
        this.folder_animation.play().then( () => {
            x_def.height = 1;
            this.folder_animation = new NS.Animation( [ x_def ], false );
            this.folder_animation.play()
            // .then( () => Bus.$emit( "Institute_FolderListCalculator" ) );
        } );
    } );

}

// -- =====================================================================================

coordinator ( place: TS.Place ) {

    let origin = ( this.$refs.myFolder as any ).nativeView;

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

}

// -- =====================================================================================

</script>

// -- =====================================================================================

<style scoped>

/*                                          */
    .divider {
        height: 1;
        margin: 12 14 22 14;
    }

    .light .divider { background-color: #7d8588 }
    .dark  .divider { background-color: #565a5f }

/*                                          */
    .shortLink {
        text-align: center;
        font-size: 20px;
        width: 33;
        padding: 8.6 0 0 5; 
        margin: 0; 
        background-color: transparent;
    }

    .light .shortLink { color: #b8b8b8 }
    .dark  .shortLink { color: #c7cfc2 }

/*                                          */

    .folder {
        border-radius: 7;
        background-position: center;
        background-repeat: no-repeat;
        background-size: cover;
        android-elevation: 5;
    }

    .light .folder { background-color: #b8b8b8; }
    .dark  .folder { background-color: #2178c8; }

    .miniFolder .folder{
        height: 95;
        width: 170;
        margin: 10;
        font-size: 12px;
    }

/*                                          */

.specialFolder { font-weight: bold }
    .light .specialFolder { background-color: #10b3ff }
    .dark  .specialFolder { background-color: #031f2c }

/*                                          */

    .line_label {
        height: auto;
        text-wrap: true;
        width: 90%;
        vertical-align: bottom;
        margin-bottom: 5%;
        text-align: center;
        font-family: Raleway-Regular;
        border-radius: 7;
        padding: 8 14;
        opacity: .75
    }

    .light .line_label {
        color: #ffffff;
        background-color: #24756a;
    }

    .dark .line_label {
        color: #f1f1f1;
        background-color: #041311;
    }

/*                                          */

    .middle_label{
        line-height: 1;
        font-size: 14px;
        font-family: Raleway-Regular;
        text-align: right;
        text-wrap: true;
        margin-left: 46%;
        width: 55%;
        border-left-width: 3;
        height: 100%;
        padding: 15% 10% 0% 5%;
        border-radius: 0 7 7 0;
    }

    .light .middle_label { 
        color: #242424;
        background-color: rgba(188, 220, 224, 0.9);
        border-left-color: #242424;
    }
    .dark  .middle_label { 
        color: #a09e9b;
        background-color: rgba(36, 36, 36, 0.95);
        border-left-color: #000000;
    }

/*                                          */

    .big_label{
        font-size: 19px;
        font-family: Raleway-Regular;
        text-align: right;
        vertical-align: middle;
        padding-right: 19%;
        padding-top: 3%;
    }

    .light .big_label { color: #242424 }
    .dark  .big_label { color: #a09e9b }

/*                                          */

    .icon {
        width: auto;
        text-align: left;
        vertical-align: middle;
    }

    .light .icon { color: #073449 }
    .dark  .icon { color: #a89c9c }

    .miniFolder .icon {
        padding-left:16%;
    }

/*                                          */
    .separator {
        height: 70%;
    }

    .light .separator { background-color: whitesmoke }
    .dark  .separator { background-color: gray }

/*                                          */

    .shop { font-weight: bold }

    .light .shop { background-color: #6a9c44 }
    .dark  .shop { background-color: #125e68 }
    .light .shop .icon { color: #ccd2d4 }
    .dark  .shop .icon { color: #ccd2d4 }
    .light .shop .specialLabel { color: #e7e8e9 }
    .dark  .shop .specialLabel { color: #e7e8e9 }

    .light .shopItem .icon { color: #292728 }
    .dark  .shopItem .icon { color: #25021e }

/*                                          */

    .light .HiddenFolder { border-color: #cecece }
    .dark  .HiddenFolder { border-color: #f1f1f1 }

    .light .HiddenFolderIcon { 
        background-color: rgba(255, 255, 255, 0.6);
        color: rgb(18, 100, 133);
        android-elevation: 1
    }
    .dark  .HiddenFolderIcon {
        background-color: rgba(0, 0, 0, 0.7);
        color: #d8d8d8;
        android-elevation: 1
    }

/*                                          */

    .managingBox {
        background-color: rgba(26, 27, 27, .9);
        border-radius: 6;
        transform: scale(0,0);
        height: 100%;
        width: 100%;
        visibility: hidden;
        vertical-align: middle;
    }

    .deleteButton {
        font-size: 40;
        color: red;
        height: 60;
        width: 60;
        border-radius: 5;
    }

/*                                          */

    .category { font-weight: bold }

    .light .category { background-color: #f8f5ee }
    .dark  .category { background-color: #1a282c }
    .light .category .icon { color: #6a9c44 }
    .dark  .category .icon { color: #0c878b }

</style>