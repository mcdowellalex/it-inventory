import React, {useState, useEffect, useContext} from 'react'
import {sortTable} from '../../../utilities/quickSort'
import {concatStyles as s} from '../../../utilities/mikesConcat'
import {cloneDeep} from 'lodash'
import {AxiosService, URL} from '../../../services/AxiosService/AxiosService'
import {format} from '../../../utilities/formatEmptyStrings'
import {formatDate} from '../../../utilities/FormatDate'
import {checkImage} from '../../../utilities/CheckImage'

// Components
import {FilteredSearch} from '../../reusables/FilteredSearch/FilteredSearch'
import {Button} from '../../reusables/Button/Button'
import {Group} from '../../reusables/Group/Group'
import {Table} from '../../reusables/Table/Table'
import {History} from 'history'

// Context
import {LoginContext} from '../../App/App'

// Styles
import styles from './HardwareListPage.module.css'
import placeholder from '../../../content/Images/Placeholders/peripheral-placeholder.png'

// Types
interface IPeripheralListPageProps {
    history: History
}
interface IPeripheralData {
    name: string
    id: number
    purchaseDate: string
    assigned: string
    //icon: string
}
interface IPulledData {
    peripheralName: string
    peripheralType: string
    peripheralId: number
    purchaseDate: string
    isAssigned: boolean
    employeeFirstName: string
    employeeLastName: string
    icon: string
}

// Primary Component
export const PeripheralListPage: React.SFC<IPeripheralListPageProps> = props => {
    const {history} = props
    const {
        loginContextVariables: {isAdmin},
        loginContextVariables,
    } = useContext(LoginContext)
    const axios = new AxiosService(loginContextVariables)

    // state
    const [listData, setListData] = useState<IPeripheralData[]>([])
    const [archivedData, setArchivedData] = useState<IPeripheralData[]>([])
    const [filteredData, setFilteredData] = useState<IPeripheralData[]>([]) //this is what is used in the list
    const [search, setSearch] = useState('')
    const [selected, setSelected] = useState({label: 'Make & Model', value: 'name'})

    const columns = ['name', 'purchaseDate', 'assigned']
    const headerList = ['Make & Model', 'Purchase Date', 'Assigned To']
    const options = columns.map((c, i) => ({label: headerList[i], value: c}))
    const [isArchive, setIsArchive] = useState(false)

    const [useImages, setUseImages] = useState(false)
    const [images, setImages] = useState<{id: number; img: string}[]>([])
    const [displayImages] = useState<{id: number; img: string}[]>([])

    useEffect(() => {
        axios
            .get('/list/peripherals')
            .then((data: IPulledData[]) => {
                const peripherals: IPeripheralData[] = []
                var imgs: {id: number; img: string}[] = []
                data.map((i: IPulledData) => {
                    peripherals.push({
                        name: format(i.peripheralName + ' ' + i.peripheralType),
                        id: i.peripheralId,
                        purchaseDate: format(i.purchaseDate),
                        assigned: format(i.isAssigned ? i.employeeFirstName + ' ' + i.employeeLastName : '-'),
                    })
                    imgs.push({id: i.peripheralId, img: i.icon})
                })
                setListData(peripherals)

                setImages(imgs)
                setUseImages(true)
            })
            .catch((err: any) => console.error(err))
        axios
            .get('/archivedList/peripheral')
            .then((data: IPulledData[]) => {
                const peripherals: IPeripheralData[] = []
                data.map((i: IPulledData) =>
                    peripherals.push({
                        name: format(i.peripheralName + ' ' + i.peripheralType),
                        id: i.peripheralId,
                        purchaseDate: format(i.purchaseDate),
                        assigned: format(i.isAssigned ? i.employeeFirstName + ' ' + i.employeeLastName : '-'),
                    })
                )
                setArchivedData(peripherals)
            })
            .catch((err: any) => console.error(err))
    }, [])

    useEffect(() => {
        // Search through listData based on current value
        // of search bar and save results in filtered
        if (isArchive) {
            var filteredTableInput = archivedData.filter((row: any) => {
                return !row[selected.value]
                    ? false
                    : row[selected.value]
                          .toString()
                          .toLowerCase()
                          .search(search.toLowerCase()) !== -1
            })
            setFilteredData(filteredTableInput)
        } else {
            var filteredTableInput = listData.filter((row: any) => {
                return !row[selected.value]
                    ? false
                    : row[selected.value]
                          .toString()
                          .toLowerCase()
                          .search(search.toLowerCase()) !== -1
            })
            setFilteredData(filteredTableInput)
        }
    }, [search, selected, listData, isArchive])

    //Set display Images
    useEffect(() => {
        images.map((img: {id: number; img: string}) =>
            checkImage(img.img, axios, placeholder).then(data => {
                var list = images.filter(i => i.id !== img.id)
                setImages([...list, {id: img.id, img: data}])
                displayImages.push({id: img.id, img: data})
            })
        )
    }, [useImages])

    const handleClick = () => {
        history.push('/hardware/edit/peripheral/new')
    }

    const handleRowClick = (row: any) => {
        history.push(`hardware/detail/peripheral/${row[0].key}`)
    }

    var filteredRows: any[] = []
    filteredData.forEach(rowObj => {
        filteredRows.push(Object.values(rowObj))
    })

    const [rows, setRows] = useState(filteredRows)
    useEffect(() => {
        setRows(filteredRows)
    }, [filteredData])
    //-------------- this will all be the same -------------
    const headerStates = []
    const headerStateCounts = []

    //initialize all the header states and styling to be not sorted
    for (let i = 0; i < headerList.length; i++) {
        headerStates.push(styles.descending)
        headerStateCounts.push(0)
    }
    //var initHeaderStates = cloneDeep(headerStates)
    var initHeaderStateCounts = cloneDeep(headerStateCounts)
    var tempHeaderStates = cloneDeep(headerStates)
    var tempHeaderStateCounts = cloneDeep(headerStateCounts)

    var initState = {headerStates, headerStateCounts}
    const [sortState, setSortState] = useState(initState)

    function sortStates(index: number) {
        if (sortState.headerStateCounts[index] == 0) {
            tempHeaderStates[index] = styles.descending
            tempHeaderStateCounts[index] = 1
            setSortState({headerStates: tempHeaderStates, headerStateCounts: tempHeaderStateCounts})
            tempHeaderStateCounts = [...initHeaderStateCounts]
        } else if (sortState.headerStateCounts[index] == 1) {
            tempHeaderStates[index] = styles.ascending
            tempHeaderStateCounts[index] = 0
            setSortState({headerStates: tempHeaderStates, headerStateCounts: tempHeaderStateCounts})
            tempHeaderStateCounts = [...initHeaderStateCounts]
        }
    }

    const renderHeaders = () => {
        var headers = []

        var firstHeader = (
            <td
                onClick={e => {
                    setRows(sortTable(rows, 0, sortState.headerStateCounts[0]))
                    sortStates(0)
                }}
            >
                <div className={s(styles.header, styles.nameHeader)}>
                    {headerList[0]}
                    <div className={sortState.headerStates[0]} />
                </div>
            </td>
        )
        headers.push(firstHeader)

        for (let i = 1; i < headerList.length; i++) {
            let header = (
                <td
                    onClick={e => {
                        setRows(sortTable(rows, i + 1, sortState.headerStateCounts[i]))
                        sortStates(i)
                    }}
                >
                    <div className={styles.header}>
                        {headerList[i]}
                        <div className={sortState.headerStates[i]} />
                    </div>
                </td>
            )
            headers.push(header)
        }
        return headers
    }

    function concatenatedName(row: any[]) {
        return displayImages &&
            displayImages.filter(x => x.id === row[1]) &&
            displayImages.filter(x => x.id === row[1])[0] ? (
            <td key={row[1]} className={styles.hardware}>
                <div className={styles.imgContainer}>
                    <img className={styles.icon} src={displayImages.filter(x => x.id === row[1])[0].img} alt={''} />
                </div>
                <div className={styles.alignLeft}>
                    <div className={styles.hardwareName}>{row[0]}</div>
                </div>
            </td>
        ) : (
            <td key={row[1]} className={styles.hardware}>
                <div className={styles.imgContainer}>
                    <img className={styles.icon} src={placeholder} alt={''} />
                </div>
                <div className={styles.alignLeft}>
                    <div className={styles.hardwareName}>{row[0]}</div>
                </div>
            </td>
        )
    }
    // ------------------------------------------------------------
    var renderedRows: any[] = []

    //this is where the individual rows are rendered
    rows.forEach(row => {
        const transformedRow: any[] = []
        transformedRow.push(concatenatedName(row))
        transformedRow.push(<td className={styles.alignLeft}>{formatDate(row[2])}</td>)
        transformedRow.push(<td className={styles.alignLeft}>{row[3]}</td>)

        renderedRows.push(transformedRow)
    })

    return (
        <div className={styles.listMain}>
            <Group direction='row' justify='between' className={styles.group}>
                <div className={styles.buttonContainer}>
                    <Button text='Add' icon='add' onClick={handleClick} />
                    <Button
                        text={isArchive ? 'View Active' : 'View Archives'}
                        onClick={() => setIsArchive(!isArchive)}
                        className={styles.archiveButton}
                    />
                </div>

                <FilteredSearch
                    search={search}
                    setSearch={setSearch}
                    options={options}
                    selected={selected}
                    setSelected={setSelected}
                />
            </Group>
            <div className={styles.table}>
                <Table headers={renderHeaders()} rows={renderedRows} onRowClick={handleRowClick} />
            </div>
        </div>
    )
}
