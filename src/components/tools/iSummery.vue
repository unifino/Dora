<template>
<GridLayout columns="*,auto,25" rows="8*,20*" height="100%" width="100%" >
    <GridLayout col=1 rows="auto,*" row=1 >
        <GridLayout row=0 rows="*" columns="*,auto,*" >

<!---------------------------------------------------------------------------------------->

            <StackLayout class="fas" col=1 ref="panel" >

                <GridLayout
                    height="auto"
                    v-for="(inf,i) in info" 
                    :key="i" 
                    columns="*,*" 
                    class="dataBox" 
                    rows="augearControlto"
                    @tap="hint(inf.hint)"
                >
                    
                    <Label
                        v-if="inf.icon" 
                        col=0 
                        :class="'fas icon ' + inf.class" 
                        :text='String.fromCharCode( "0x" + inf.icon )' 
                    />
                    <Label col=1 :class="'data ' + inf.class" :text='inf.data' />

                </GridLayout>

            </StackLayout>

    <!---------------------------------------------------------------------------------------->

        </GridLayout>
    </GridLayout>
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

// -- =====================================================================================

@Component ( { 
    components: { } 
} )

// -- =====================================================================================

export default class FolderInfo extends Vue {

// -- =====================================================================================

data: TS.Lesson|TS.Ribosome;

// -- =====================================================================================

info: [ { hint: string, class: string, icon: string, data: number|string }? ] = [];

// -- =====================================================================================

mounted () {

    ( this.$refs.panel as any ).nativeView.animate( { 
        scale: { x: 0, y: 0 },
        opacity: 0,
        duration: 0
    } );

}

// -- =====================================================================================

newData ( data: TS.Lesson|TS.Ribosome ) { 
    this.data = data;
    this.panel( this.data === null ? 0 : 1 );
}

// -- =====================================================================================

panel ( state: 0|1 ) {

    if ( state ) this.info = [];

    if ( this.data ) {

        if ( ( this.data as TS.Lesson ).chromosome ) {
            let lesson = this.data as TS.Lesson;
            this.setLessonData();
        }

        if ( ( this.data as TS.Ribosome ).code ) {
            let ribosome = this.data as TS.Ribosome;
            this.setRibosomeData();
        }

    }

    this.panelAnimator( state );

}

// -- =====================================================================================

panelAnimation: NS.Animation;
panelAnimator ( state: 0|1  ) {

    if ( this.panelAnimation && this.panelAnimation.isPlaying ) return 0;

    let x_def: NS.AnimationDefinition = {};

    x_def.target    = ( this.$refs.panel as any ).nativeView;
    x_def.curve     = NS.Enums.AnimationCurve.easeInOut;
    x_def.opacity   = state;
    x_def.duration  =  50 + 200*state;
    
    this.panelAnimation = new NS.Animation( [ x_def ], false );

    this.panelAnimation.play();

}

// -- =====================================================================================

hint ( hint: string ) {
    tools.toaster( hint );
}


// -- =====================================================================================

getLessonProperties () {

    let is = store.state.inHand.institute,
        unix: string,
        has: boolean,
        lesson = this.data as TS.Lesson,
        uContext = lesson.protoplasm.find( x => x.type === "dText" ).content;

    let dataBox: {
        unix       : { [key: string]: number[] },
        new        : { [key: string]: number[] },
        total      : number,
    } = { 
        unix    : {}, 
        new     : {},
        total   : 0 
    };

    // .. bug resolver
    if (  !uContext || !uContext.length ) return dataBox;

    // .. get list of unixes
    for ( let i=0; i < lesson.protoplasm.find( x => x.type === "dText" ).content.length; i++ ) {
        
        unix = tools.trimmer( uContext[i][0] );
        has = Object.keys( dataBox.unix ).includes( unix );
        
        if ( unix ) dataBox.total++;

        if ( !has ) dataBox.unix[ unix ] = [i];
        else        dataBox.unix[ unix ].push(i);

    }

    // .. get data on base of unixes
    let ins = lesson.chromosome.institute;
    for ( let unix of Object.keys( dataBox.unix ) ) {
        if ( tools.wordStating( uContext[ dataBox.unix[ unix ][0] ][0], ins ) === "N" )
            dataBox.new[ unix ] = dataBox.unix[ unix ];
    }

    return dataBox;

}

// -- =====================================================================================

setLessonData () {

    let g = ( this.data as TS.Lesson ).chromosome;
    let c = this.getLessonProperties();

    this.info.push ( { 
        hint: "CEF Level", 
        class: 'l ' + g.level, 
        icon: '', 
        data: g.level 
    } );
    
    this.info.push ( { 
        hint: "New Words", 
        class: 'c', 
        icon: 'f4d8', 
        data: Object.keys( c.new  ).length 
    } );
    
    this.info.push ( { 
        hint: "Total Words (without repetition)", 
        class: 'd', 
        icon: 'f543', 
        data: Object.keys( c.unix ).length 
    } );
    
    this.info.push ( { 
        hint: "Total Words", 
        class: 'e', 
        icon: 'f02d', 
        data: c.total 
    } );

    let org = (this.data as TS.Lesson).protoplasm.find( x => x.type === "dVideo" );
    if ( org && org.isYouTube ) {
        this.info.push ( {
            hint: "Source",
            class: 'd',
            icon: 'f129',
            data: "YouTube"
        } );
    }

}

// -- =====================================================================================

setRibosomeData () {

    let r = ( this.data as TS.Ribosome );
    let c = storage.have_these_on_local( r ).length;

    this.info.push ( { 
        hint: "CEF Level", 
        class: 'l ' + r.level, 
        icon: '', 
        data: r.level 
    } );

    this.info.push ( { 
        hint: "Already Read", 
        class: 'c', 
        icon: 'f530', 
        data: c 
    } );
    
    this.info.push ( { 
        hint: "Total Lessons", 
        class: 'e', 
        icon: 'f518', 
        data: r.contains 
    } );

    this.info.push ( { 
        hint: "Source: " + r.source, 
        class: 'd', 
        icon: 'f21a', 
        data: r.source 
    } );

}

// -- =====================================================================================

}

// -- =====================================================================================

</script>

// -- =====================================================================================

<style scoped>

/*                                          */

    .dataBox {
        width: 110;
        border-radius: 5;
        margin-bottom: 15;
    }

    .icon { 
        font-size: 30; 
        text-align: center;
    }
    
    .data { 
        text-align: center;
        font-family: Farsan-Regular;
        font-size: 15;
        padding-top: 10%;
    }

    .l {
        font-family: Dosis-Regular;
        letter-spacing: .15px;
        margin-bottom: 10;
        margin-left: -55;
        font-size: 40;
    }

    .light .A1 { color: #31bbe6 }
    .dark  .A1 { color: #2ca7cc }
    
    .light .A2 { color: #0f8db3 }
    .dark  .A2 { color: #1a82a1 }
    
    .light .B1 { color: #7bbb27 }
    .dark  .B1 { color: #54a017 }
    
    .light .B2 { color: #e6881c }
    .dark  .B2 { color: #c58715 }
    
    .light .C1 { color: #e64c1d }
    .dark  .C1 { color: #c53e15 }
    
    .light .C2 { color: #c515b6 }
    .dark  .C2 { color: #8d2f85 }

    .light .a { color: #54a017 }
    .dark  .a { color: #44850e }
    
    .light .b { color: #1890b4 }
    .dark  .b { color: #247bd1 }

    .light .c { color: #69d312 }
    .dark  .c { color: #56af0d }

    .light .d { color: #3abedb }
    .dark  .d { color: #0b7981 }

    .light .e { color: #646464 }
    .dark  .e { color: #bdaa87 }

    .light .f { color: #dd2095 }
    .dark  .f { color: #bdaa87 }

</style>