import React, { Component } from 'react'
import { View, Text, StyleSheet, FlatList, Image, TouchableHighlight, ActivityIndicator } from 'react-native'
import AsyncStorage from '@react-native-community/async-storage';

import api from '../../services/api'
import Add from '../../assets/icons/botaoadd.svg' 

export default class Camisas extends Component {
    constructor(props) {
        super(props) 
        this.onEndReachedCalledDuringMomentum = true;  
        this.state = {
            garment: [],
            page: 0,
            token: '', 
            loading: false,
            refresh: true, 
            total: 0,
        }
    }

    async componentDidMount() {

        const asyncToken = await AsyncStorage.getItem('@Baloo:token');
        console.log("COMPONETDIDMOUNT"); 

        const AuthStr = 'Bearer '.concat(asyncToken);  

        this.setState({
            token: AuthStr
        })

        this.loadPage() 
        
    }

    async loadPage (pageNumber = this.state.page, shouldRefresh = false)  {  
       
        if(pageNumber > this.state.total){
            console.log("FIM" + this.state.total)
            return
        }

        try{   
            console.log("LOADPAGE")

            this.setState({ loading: true });

            const response = await api.get(`/api/v1/garment?skip=${pageNumber*20}&limit=20`, { 'headers': { 'Authorization': this.state.token } });

            console.log("RESPONDE.DATA: " + response)
            const data = await response.data.data;

            console.log("DATA: " + data)
            console.log("PAGE NUMBER: " + pageNumber)

            const totalAmount = await response.data.totalAmount;

            console.log("TOTAL: " + totalAmount)
                

            this.setState({
                garment: shouldRefresh ? data : [...this.state.garment, ...data],
                page: pageNumber + 1,
                loading: false,
                refresh: false,
                total: Math.ceil(totalAmount / 20),
            })

            console.log("PAGE NUMBER(2): " + this.state.page)

        }catch(err){
            console.log(err)
    
        }  
    }

    refreshList = async () => {
        this.setState({ refresh: true })

        console.log("REFRESH LIST");
        await this.loadPage(0, true);

        this.setState({ refresh: false })
    }

    render() {
        console.log("GARMENT: " + this.state.garment)
        console.log(this.state.garment.length)
        console.log("TOTAL" + this.state.total)
        return ( 
            <View style={styles.container}>
                <View style={{flex: 9, backgroundColor: "#C4D0D0"}} >
                <FlatList
                contentContainerStyle={{paddingLeft: 5, paddingTop: 10}}
                numColumns={2} 
                data={this.state.garment}
                onEndReached={() => {if(!this.onEndReachedCalledDuringMomentum){
                    this.loadPage();                    
                    this.onEndReachedCalledDuringMomentum = true;
                    console.log("ONENDREACHED: " + this.state.page);
                }}}
                onEndReachedThreshold={0.5}
                onMomentumScrollBegin={() => { this.onEndReachedCalledDuringMomentum = false;}}
                ListFooterComponent={this.state.loading && <ActivityIndicator size={"small"} color={"#999"} style={{margin: 30}} />}
                onRefresh={this.refreshList}
                refreshing={this.state.refresh}
                keyExtractor={post => String(post.id)}
                renderItem={({ item }) => (
                     <View>  
                         <TouchableHighlight style={styles.garmentBox} onPress={() => this.props.navigation.navigate('Display')}>
                            <Image style={{width: 170, height: 180, alignSelf: "center", margin: 10}} source={{uri: item.default_image}} />
                        </TouchableHighlight>          
                    </View>
                
                 )}
                />      
                <View style={styles.text}>
                    <TouchableHighlight onPress={() => this.props.navigation.navigate('Camera')} style={{alignSelf: "center"}}>
                        <Add width={60} height={60} />
                    </TouchableHighlight>
                </View>
                </View>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF'
    },
    text: {
        flex: 0,
        flexDirection: 'row',
        justifyContent: "center"
    },
    garmentBox: {
        backgroundColor: "white",
        borderRadius: 20,
        flexGrow: 1,
        flexBasis: 0,
        margin: 5, 
        flexDirection: 'row',
    },
})

