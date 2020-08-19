import React, { useEffect, useState } from 'react';
import { Image, ScrollView } from 'react-native';

import Icon from 'react-native-vector-icons/Feather';
import { useNavigation } from '@react-navigation/native';
import Logo from '../../assets/logo-header.png';
import SearchInput from '../../components/SearchInput';

import api from '../../services/api';
import formatValue from '../../utils/formatValue';

import {
  Container,
  Header,
  FilterContainer,
  Title,
  CategoryContainer,
  CategorySlider,
  CategoryItem,
  CategoryItemTitle,
  FoodsContainer,
  FoodList,
  Food,
  FoodImageContainer,
  FoodContent,
  FoodTitle,
  FoodDescription,
  FoodPricing,
} from './styles';

interface Food {
  id: number;
  name: string;
  description: string;
  price: number;
  category: number;
  thumbnail_url: string;
}

interface Category {
  id: number;
  title: string;
  image_url: string;
}

const Dashboard: React.FC = () => {
  const [foods, setFoods] = useState<Food[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<
    number | undefined
  >();
  const [searchValue, setSearchValue] = useState('');

  const navigation = useNavigation();

  async function handleNavigate(id: number): Promise<void> {
    navigation.navigate('FoodDetails', { id });
  }

  useEffect(() => {
    async function loadFoods(): Promise<void> {
      // fazendo uma requisição get passando como parâmetro a categoria selecionada,
      // para encontrarmos apenas as foods que sejam daquela categoria
      await api
        .get('foods', {
          params: {
            category_like: selectedCategory,
            // se não tiver nenhuma categoria selecionada, ele retorna todas as foods
          },
        })
        .then(response => {
          // setando o array de foods para aparecer em tela
          setFoods(response.data);
        });
    }
    loadFoods();
  }, [selectedCategory]);

  useEffect(() => {
    async function loadCategories(): Promise<void> {
      // procurando por todas as categorias e setando elas para aparecer em tela
      api.get('categories').then(response => setCategories(response.data));
    }

    loadCategories();
  }, []);

  function handleSelectCategory(id: number): void {
    setSelectedCategory(id);
  }

  // Função que será disparada após o usuário fazer o submit da pesquisa
  async function handleSearchFoodByName(): Promise<void> {
    // pegando a food que tiver o nome que foi digitado
    const response = await api.get(`foods/?name=${searchValue}`);
    // setando a food para aparecer em tela
    setFoods(response.data);
    // procurando se a food existe, pois é retornado um array de foods, por mais que a food informada
    // seja apenas 1, precisamos usar o find para ter acesso as suas propriedades
    response.data.find((food: Food) =>
      // se o nome for encontrado faça um set na categoria, se não retorne 0
      food.name === searchValue ? setSelectedCategory(food.category) : 0,
    );
  }

  return (
    <Container>
      <Header>
        <Image source={Logo} />
        <Icon
          name="log-out"
          size={24}
          color="#FFB84D"
          onPress={() => navigation.navigate('Home')}
        />
      </Header>
      <FilterContainer>
        <SearchInput
          value={searchValue}
          onChangeText={setSearchValue}
          placeholder="Qual comida você procura?"
          onSubmitEditing={handleSearchFoodByName}
        />
      </FilterContainer>
      <ScrollView>
        <CategoryContainer>
          <Title>Categorias</Title>
          <CategorySlider
            contentContainerStyle={{
              paddingHorizontal: 20,
            }}
            horizontal
            showsHorizontalScrollIndicator={false}
          >
            {categories.map(category => (
              <CategoryItem
                key={category.id}
                isSelected={category.id === selectedCategory}
                onPress={() => handleSelectCategory(category.id)}
                activeOpacity={0.6}
                testID={`category-${category.id}`}
              >
                <Image
                  style={{ width: 56, height: 56 }}
                  source={{ uri: category.image_url }}
                />
                <CategoryItemTitle>{category.title}</CategoryItemTitle>
              </CategoryItem>
            ))}
          </CategorySlider>
        </CategoryContainer>
        <FoodsContainer>
          <Title>Pratos</Title>
          <FoodList>
            {foods.map(food => (
              <Food
                key={food.id}
                onPress={() => handleNavigate(food.id)}
                activeOpacity={0.6}
                testID={`food-${food.id}`}
              >
                <FoodImageContainer>
                  <Image
                    style={{ width: 88, height: 88 }}
                    source={{ uri: food.thumbnail_url }}
                  />
                </FoodImageContainer>
                <FoodContent>
                  <FoodTitle>{food.name}</FoodTitle>
                  <FoodDescription>{food.description}</FoodDescription>
                  <FoodPricing>{formatValue(food.price)}</FoodPricing>
                </FoodContent>
              </Food>
            ))}
          </FoodList>
        </FoodsContainer>
      </ScrollView>
    </Container>
  );
};

export default Dashboard;
