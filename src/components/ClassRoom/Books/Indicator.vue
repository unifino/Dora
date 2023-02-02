<template>
<GridLayout rows="*,auto,24" columns="24,24,24,*,24" >

    <FlexboxLayout
        row=1
        col=3
        ref="indicatorBar"
        class="indicatorBar"
        orientation="horizontal"
        horizontalAlignment="center"
        flexWrap="wrap"
        flexDirection="row"
        justifyContent="center"
        :visibility="isVisible ? 'visible' : 'collapsed'"
    >

        <StackLayout
            :class="i === currentIndex ? 'idx onIt' : 'idx'"
            ref="idx"
            v-for="i in dots"
            :key="i"
            @tap="$parent.jumpTo(i-1)"
            verticalAlignment="middle"
            :visibility="dots > 1 ? 'visible' : 'collapsed'"
        >
            <StackLayout class='dot' /> 
        </StackLayout>

    </FlexboxLayout>

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
import Bus                              from "@/mixins/bus"

// -- =====================================================================================

@Component ( { 
    components: { } 
} )

// -- =====================================================================================

export default class Indicator extends Vue {

// -- =====================================================================================

@Prop() dots: number;
@Prop() currentIndex: number;

// -- =====================================================================================

isVisible = true;

// -- =====================================================================================

mounted () {
    Bus.$on( 'Indicator_visibility', this.toggleVisibility );
    // .. set the width of indicatorBar
    let indicatorBar = this.$refs.indicatorBar as any;
    indicatorBar.nativeView.width = store.state.windowSize.width > 600 ? 240 : 150;
}

// -- =====================================================================================

toggleVisibility ( state: boolean ) {
    this.isVisible = state;
}

// -- =====================================================================================

destroyed () {
    Bus.$off( 'Indicator_visibility' );
}

// -- =====================================================================================

}

// -- =====================================================================================

</script>

// -- =====================================================================================

<style scoped>

/*                                          */
.indicatorBar {
    height: auto;
    width: 240;
    line-height: 0;
}

.idx {
    height: 15;
    width: 15;
}

.idx .dot{
    border-width: 1;
    border-radius: 10;
    height: 6;
    width: 6;
    margin: 0 4;
}

.light .idx .dot{
    border-color: #666666;
    background-color: #c7dfe7;
}
.dark  .idx .dot{
    border-color: black;
    background-color: #282b2c;
}

.light .onIt .dot{ background-color: rgba(23, 173, 243, 0.774) }
.dark  .onIt .dot{ background-color: rgba(9, 127, 131, 0.644) }

</style>