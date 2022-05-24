import React, { useEffect, useState } from 'react'
import axios from 'axios'
import styled from 'styled-components'
import { BiSearchAlt2 } from 'react-icons/bi'

function App() {
  const [searchValue, setSearchValue] = useState('') //검색값
  const [result, setResult] = useState('') //검색 후 결과 값
  const [timer, setTimer] = useState(0) // 지연 검색
  const [existValue, setExistValue] = useState(false) //검색값 존재 유무
  const [dropDownList, setDropDownList] = useState([]) //드롭메뉴 리스트
  const [dropDownIndex, setDropDownIndex] = useState(-1) // 드롭메뉴 인덱스


  //300ms 지연 디바운싱
  const changeValue = (e) => {
    setSearchValue(e.target.value)
    setExistValue(true)
    if (timer) {
      clearTimeout(timer)
    }
    const delay = setTimeout(async () => {
      try {
        await axios.get(`http://hn.algolia.com/api/v1/search?query=${searchValue}`)
          .then((res) => {
            const titleMap = res.data.hits.map((el) => el.title)
            setDropDownList(titleMap)
          })
      } catch (err) {
        console.log(err)
      }
    }, 300);
    setTimer(delay)
  }
  //최종 검색 함수
  const submit = async () => {
    try {
      await axios.get(`http://hn.algolia.com/api/v1/search?query=${searchValue}`)
        .then((res) => {
          setResult(res.data.hits[dropDownIndex])
          console.log(res.data.hits[dropDownIndex])
          setDropDownIndex(-1)
        })
    } catch (err) {
      console.log(err)
    }
  }
  //키입력 반응 함수
  const handleKey = (e) => {
    if (e.key === 'ArrowDown' && dropDownList.length - 1 > dropDownIndex) {
      setDropDownIndex(dropDownIndex + 1)
    }
    if (e.key === 'ArrowUp' && dropDownIndex >= 0) {
      setDropDownIndex(dropDownIndex - 1)
    }

    if (e.key === 'Enter' && dropDownIndex >= 0) {
      selectDropDown(dropDownList[dropDownIndex])
      submit()
      setDropDownIndex(-1)
    }
  }
  //드롭메뉴에서 선택
  const selectDropDown = (el) => {
    setSearchValue(el)
    setExistValue(false)
  }
  //검색입력 없을 시 드롭메뉴 숨기기
  useEffect(() => {
    if (searchValue === '' || searchValue === null) {
      setExistValue(false)
      setDropDownList([])
    }
    if (dropDownIndex !== -1) {
      setSearchValue(dropDownList[dropDownIndex])
    }
  }, [searchValue, dropDownIndex])
  return (
    <Container>
      <Title>Pluto-search</Title>
      <Search existValue={existValue}>
        <BiSearchAlt2 color='gray' />
        <SearchInput
          type='text'
          value={searchValue || ''}
          onKeyUp={handleKey}
          onChange={changeValue}
          placeholder='검색어를 입력해주세요'
        />
        <DeleteButton onClick={() => {
          setSearchValue('')
          setDropDownIndex(-1)
        }}>&times;</DeleteButton>
      </Search>
      {existValue && (
        <ItemUl>
          {dropDownList.length === 0 && (<ItemLi>검색 결과가 없습니다.</ItemLi>)}
          {dropDownList.map((dropDown, idx) => {
            return (
              <ItemLi
                key={idx}
                className={dropDownIndex === idx ? 'select' : ''}
                onClick={() => {
                  selectDropDown(dropDown)
                  submit()
                  setDropDownIndex(-1)
                }}
                onMouseOver={(e) => {
                  setDropDownIndex(idx)
                  setSearchValue(e.target.outerText)
                }}>
                {dropDown}
              </ItemLi>
            )
          })}
        </ItemUl>
      )}
      <br />
      {result ?
        (<Result>
          Title : {result.url ? <a href={result.url} target="_blank">{result.title}</a> : 'null'}<br />
          Author : {result.author ? result.author : 'null'}<br />
          Pointer : {result.points ? result.points : 'null'}<br />
          Comment : {result.comment_text ? result.comment_text : 'null'}<br />
        </Result>)
        : ''
      }

    </Container>
  );
}

//css
const Container = styled.div`
  max-width: 700px;
  margin: auto;
`
const Title = styled.div`
  display: flex;
  margin-top: 200px;
  justify-content: center;
  color: white;
  font-size: 50px;
  font-weight: bolder;
`

const ItemUl = styled.ul`
  display: block;
  margin: 0 auto;
  padding: 8px 0;
  background-color: #303134;
  border: 1px solid rgba(0, 0, 0, 0.3);
  border-top: none;
  border-radius: 0 0 20px 20px;
  box-shadow: 0 10px 10px rgb(0, 0, 0, 0.3);
  list-style-type: none;
  z-index: 3;
`

const ItemLi = styled.li`
  padding: 6px 15px;
  color: white;
  &.select {
    background-color: gray;
  }
`
const Search = styled.div`
  display: flex;
  box-shadow: 0 4px 6px 0 #171717;
  margin-top: 30px;
  padding: 10px;
  border-radius: ${props => props.existValue ? '20px 20px 0 0' : '20px 20px 20px 20px'};
  background-color: #202124;
  flex-direction: row;
  border: 1px solid rgba(92, 96, 101, 2);
  z-index: 4;
  &:hover{
    background-color: #303134;
  }
  &:focus-within{
    background-color: #303134;
  }
  `
const Result = styled.div`
  background-color: whitesmoke;
  border: 2px solid rgba(0, 0, 0, 0.3);
  border-radius: 3px;
`
const SearchInput = styled.input`
  flex: 1 0 0;
  color: white;
  padding: 0;
  margin: 0;
  background-color: transparent;
  border: none;
  outline: none;
  padding-left: 10px;
  font-size: 16px;
`

const DeleteButton = styled.div`
  cursor: pointer;
`

export default App;
