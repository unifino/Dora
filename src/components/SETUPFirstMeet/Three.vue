<template>
<GridLayout row=1 rows="5*,auto,20,auto,auto,*" columns="*" >
        
    <Image src="res://dora_mini" width="160" stretch="aspectFit" />

    <Label
        text="Every thing is Ready!"
        row=1
        class="format_1 centeredText" 
        textWrap="true"  
    />

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

// -- =====================================================================================

@Component ( { 
    components: { } 
} )

// -- =====================================================================================

export default class Three extends Vue {

// -- =====================================================================================

importAllow: boolean = true;

// -- =====================================================================================

}

// -- =====================================================================================

</script>

// -- =====================================================================================

<style scoped>

@import './FirstMeet.css';

/*                                          */

</style>