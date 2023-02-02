<template>
<GridLayout
    :class="myClass"
    @tap="$emit( 'tap' )"
    @longPress="$emit( 'long-press' )"
    @touch="buttonTouched"
    ref="button"
>

<!---------------------------------------------------------------------------------------->

    <GridLayout v-if="!myHint" rows="*,auto,*" columns="*,auto,*" >
        <Label row=1 col=1 :class="specialClass" :text="' ' + myLabel + ' '" />
    </GridLayout>

<!---------------------------------------------------------------------------------------->

    <GridLayout v-if="myHint" rows="*,auto,*,15" columns="*,auto,*" >
        <Label row=1 col=1 :class="specialClass" :text="' ' + myLabel + ' '" />
    </GridLayout>

    <GridLayout v-if="myHint" rows="15,*,15" columns="auto,*,auto">
       <Label row=2 col=1 :text="myHint" class="hint" />
    </GridLayout>

<!---------------------------------------------------------------------------------------->

</GridLayout>
</template>

// -- =====================================================================================

<script lang="ts">

// -- =====================================================================================

import { Vue, Component, Prop }         from "vue-property-decorator"

// -- =====================================================================================

@Component

// -- =====================================================================================

export default class nButton extends Vue {

// -- =====================================================================================

@Prop() myLabel: string;
@Prop() myClass: string;
@Prop() myHint: string;

// -- =====================================================================================

get specialClass () {
    return this.myClass.includes( "lineThrough" ) ? "lineThrough" : "";
}

// -- =====================================================================================

press_TO: NodeJS.Timeout | any;
buttonTouched ( args ) {

    switch ( args.action ) {
        
        case "down": 
            args.object.className = this.myClass + " pressed"; 
            break;
        
        case "up":   
        case "cancel": 
            args.object.className = this.myClass; 
            break;

    }

}

// -- =====================================================================================

}

// -- =====================================================================================

</script>

// -- =====================================================================================

<style scoped>

/*                                          */
    .arrowButton,
    .sizeButton,
    .confirmButton {
        text-align: center;
        font-size: 23px;
        width: 32;
        height: 40;
        margin: 0;
        border-radius: 5;
    }

    .sizeButton {
        font-size: 15px;
        margin: 0 4;
    }

    .confirmButton { font-size: 17px }

    .light .arrowButton,
    .light .sizeButton,
    .light .confirmButton {
        color:#2f5f68;
        background-color: transparent;
    }

    .dark .arrowButton,
    .dark .sizeButton,
    .dark .confirmButton {
        color:#808181;
        background-color: transparent;
    }

/*                                          */
    .boxButton {
        text-align: center;
        font-size: 23px;
        width: 70;
        height: 60;
        margin: 0 3;
        border-radius: 7;
    }

    .light .boxButton {
        color:#1f4a52;
        background-color: transparent;
    }

    .dark .boxButton {
        color:#cfe9f0;
        background-color: transparent;
    }

/*                                          */
    .dotButton {
        font-size: 23px;
        margin: 0 4;
        border-radius: 5;
        height: 38;
        width: 38;
        text-align: center;
    }

    .light .dotButton {
        background-color: rgba(227, 228, 228, 0);
    }

    .dark .dotButton {
        background-color: rgba(43, 44, 44, 0);
    }

/*                                          */
    .toolButton {
        text-align: center;
        font-size: 23px;
        width: 40;
        height: 40;
        margin: 0 3;
        border-width: 1;
        border-radius: 14;
    }

    .light .toolButton {
        color:#1f4a52;
        border-color: #1f4a52;
        background-color: #a7cef3;
    }

    .dark .toolButton {
        color:#cfe9f0;
        border-color: #2b5b7a;
        background-color: transparent;
    }

/*                                          */
    .light  .g { color: #61af18; }
    .dark   .g { color: #69a333; }
            .n { color: #318f50; }
            .r { color: #c05212; }
            .b { color: #53b2ff; }
            .o { color: #6e6e67; }
    .light  .p { color: #60b114; }
    .dark   .p { color: #9cda28; }
            .y { color: #da28da; }
            .d { color: #94962d; }

    .light .pressed {
        color: #e4e4e4;
        border-color: #929497;
        background-color: rgba(162, 169, 179, 0.5);
        android-elevation: 0;
    }

    .dark .pressed {
        color: #e4e4e4;
        border-color: #929497;
        background-color: rgba(162, 169, 179, 0.5);
        android-elevation: 0;
    }

/*                                          */
    .hint {
        font-size: 9px;
        padding-bottom: 5;
    }

/*                                          */
    .lineThrough { text-decoration: line-through }

</style>




