import React, { useState } from 'react'
import './App.css'

import { Color, SpriteBuilder, SpriteUtils } from 'spaceship-sprites'

const dimMatrix: {
    type: string
    dim: [number, number]
}[] = [
    {
        type: 'Fighter',
        dim: [5, 5]
    },
    {
        type: 'Heavy Fighter',
        dim: [5, 7]
    },
    {
        type: 'Corvette',
        dim: [5, 9]
    },
    {
        type: 'Frigate',
        dim: [5, 9]
    },
    {
        type: 'Destroyer',
        dim: [5, 9]
    },
    {
        type: 'Cruiser',
        dim: [5, 13]
    },
    {
        type: 'Interceptor',
        dim: [5, 13]
    },
    {
        type: 'Battlecruiser',
        dim: [7, 17]
    },
    {
        type: 'Battleship',
        dim: [7, 17]
    },
    {
        type: 'Carrier',
        dim: [9, 21]
    },
    {
        type: 'Starship',
        dim: [9, 21]
    },
    {
        type: 'Station',
        dim: [11, 25]
    }
]

const btnStyle = {
    position: 'fixed',
    padding: '0 16px',
    backgroundColor: '#1D3790',
    borderRadius: '2px',
    outline: 0,
    border: 'none',
    cursor: 'pointer',
    lineHeight: '36px',
    color: 'white'
}

const canvasSize = 234
const constPadding = 39

const saveSvg = (id: string): void => {
    let element = document.getElementById(id)
    if (element === null) {
        console.log(id)
        alert('Error')
        return
    }

    let svg = element.querySelector('svg')
    let canvas = document.createElement('canvas')
    canvas.width = canvasSize
    canvas.height = canvasSize
    let ctx = canvas.getContext('2d')
    let loader = new Image()

    loader.width = canvasSize
    loader.height = canvasSize

    loader.onload = () => {
        ctx?.drawImage(loader, 0, 0, loader.width, loader.height)
        let image = canvas.toDataURL()
        console.log(image)

        let link = document.createElement('a')
        link.download = id
        link.href = image
        link.click()
    }

    let svgAsXML = new XMLSerializer().serializeToString(svg as any)
    loader.src = 'data:image/svg+xml,' + encodeURIComponent(svgAsXML)
}

const App: React.FC = () => {
    let [reload, setReload] = useState(1)
    let [sameColor, setSameColor] = useState(false)

    let pallet: Array<Color> = [
        new Color(50, 10, 100),
        new Color(190, 60, 50),
        new Color(80, 70, 140)
    ]

    let padding: [number, number] = [constPadding, constPadding]

    let c = 0.4

    let config = {
        colorPallet: pallet,
        blankColor: new Color(c, c, c),
        useRandomPallet: !sameColor
    }

    return (
        <>
            <div style={{ textAlign: 'center' }}>
                <h2>Click the images to save them</h2>
            </div>
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-around',
                    flexWrap: 'wrap'
                }}>
                {dimMatrix.map((value, index) => (
                    <div key={`hehe-${index}`}>
                        <p>{value.type}</p>
                        <div
                            key={`${value.type}`}
                            id={`${value.type}`}
                            onClick={() => saveSvg(`${value.type}`)}
                            style={{ cursor: 'pointer' }}
                            dangerouslySetInnerHTML={{
                                __html: new SpriteBuilder(config)
                                    .withDim(value.dim)
                                    .single()
                                    .withEdges(Color.BLACK, 0.3)
                                    .withEdges(Color.BLACK, 0.7)
                                    .withPadding(padding)
                                    .transform(SpriteUtils.transformVignette)
                                    .build()
                                    .svgWidth(canvasSize - 1)
                            }}
                        />
                    </div>
                ))}
            </div>
            <button
                style={
                    {
                        right: '16px',
                        bottom: '16px',
                        ...btnStyle
                    } as any
                }
                onClick={() => setReload(reload * -1)}>
                Generate
            </button>
            <button
                style={
                    {
                        right: '128px',
                        bottom: '16px',
                        ...btnStyle
                    } as any
                }
                onClick={() => setSameColor(!sameColor)}>
                {sameColor ? 'Different Colors' : 'Same Colors'}
            </button>
        </>
    )
}

export default App
