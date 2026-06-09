import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MapaSvg from '../Fatec.svg?react';
import photosData from '../fotos/data.json';
import '../styles/map.css';

type CameraState = {
    x: number;
    y: number;
    size: number;
};

const desktopCamera: CameraState = { x: -840, y: -300, size: 200 };
const mobileCamera: CameraState = { x: -1049, y: -1808, size: 500 };

const Map = () => {
    const navigate = useNavigate();
    const containerRef = useRef<HTMLDivElement>(null);
    const svgRef = useRef<SVGSVGElement>(null);
    const mousePosRef = useRef({ x: 0, y: 0 });

    const [position, setPosition] = useState<CameraState>(desktopCamera);
    const [mapSize, setMapSize] = useState(desktopCamera.size);
    const [isDragging, setIsDragging] = useState(false);
    const [startPos, setStartPos] = useState({ x: 2200, y: 0 });

    const pins = [
        { id: 'auditorio', name: 'Auditório' },
        { id: 'campoAberto', name: 'Campo Aberto' },
        { id: 'ilhaPrincipal', name: 'Ilha Principal' },
        { id: 'jardimDaSecretaria', name: 'Jardim da Secretaria' },
        { id: 'lateral', name: 'Lateral' },
        { id: 'aHorta', name: 'Horta' },
        { id: 'aFatec', name: 'Fatec' },
        { id: 'atrasDaFatec', name: 'Atrás da Fatec' },
    ];

    useEffect(() => {
        const mediaQuery = window.matchMedia('(max-width: 768px)');

        const syncCamera = () => {
            const nextCamera = mediaQuery.matches ? mobileCamera : desktopCamera;
            setPosition(nextCamera);
            setMapSize(nextCamera.size);
        };

        syncCamera();
        mediaQuery.addEventListener('change', syncCamera);

        return () => {
            mediaQuery.removeEventListener('change', syncCamera);
        };
    }, []);

    useEffect(() => {
        const svg = svgRef.current;
        if (!svg) return;

        const cleanups: (() => void)[] = [];

        pins.forEach(pin => {
            const pinEl = svg.getElementById(`pin_${pin.id}`) as SVGElement | null;
            const labelEl = svg.getElementById(`label_${pin.id}`) as SVGElement | null;
            const containerEl = svg.getElementById(`container_${pin.id}`) as SVGElement | null;

            if (!pinEl || !labelEl) {
                console.warn(`Elementos faltando para: ${pin.id}. Verifique os IDs no SVG.`);
                return;
            }

            labelEl.classList.add('label-hidden');

            let isActive = false;
            let hideTimeout: number | null = null;

            const activateLabel = () => {
                if (hideTimeout) {
                    clearTimeout(hideTimeout);
                    hideTimeout = null;
                }

                if (!isActive) {
                    isActive = true;
                    pinEl.classList.add('pin-hidden');

                    pins.forEach(otherPin => {
                        if (otherPin.id === pin.id) return;
                        const otherPinEl = svg.getElementById(`pin_${otherPin.id}`) as SVGElement | null;
                        if (otherPinEl) otherPinEl.classList.add('pin-dimmed');
                    });

                    labelEl.classList.remove('label-hidden');
                    labelEl.classList.add('label-active');
                }
            };

            const deactivateLabel = () => {
                hideTimeout = window.setTimeout(() => {
                    if (isActive) {
                        isActive = false;
                        pinEl.classList.remove('pin-hidden');

                        pins.forEach(otherPin => {
                            const otherPinEl = svg.getElementById(`pin_${otherPin.id}`) as SVGElement | null;
                            if (otherPinEl) otherPinEl.classList.remove('pin-dimmed');
                        });

                        labelEl.classList.remove('label-active');
                        labelEl.classList.add('label-hidden');
                    }
                    hideTimeout = null;
                }, 100);
            };

            const onLabelClick = (e: Event) => {
                e.stopPropagation();
                const normalizedPin = pin.id.toLowerCase();
                const photoIndex = photosData.findIndex((photo: any) => {
                    const normLocal = photo.local
                        .toLowerCase()
                        .normalize("NFD")
                        .replace(/[\u0300-\u036f]/g, "")
                        .replace(/[^a-z0-9]/g, "");
                    return normLocal === normalizedPin || normLocal.includes(normalizedPin) || normalizedPin.includes(normLocal);
                });

                if (photoIndex !== -1) {
                    navigate(`/gallery/${photoIndex}`);
                } else {
                    navigate(`/gallery/0`);
                }
            };

            labelEl.addEventListener('click', onLabelClick);
            cleanups.push(() => {
                labelEl.removeEventListener('click', onLabelClick);
            });

            if (containerEl) {
                const onContainerEnter = () => activateLabel();
                const onContainerLeave = () => deactivateLabel();

                containerEl.addEventListener('mouseenter', onContainerEnter);
                containerEl.addEventListener('mouseleave', onContainerLeave);

                cleanups.push(() => {
                    containerEl.removeEventListener('mouseenter', onContainerEnter);
                    containerEl.removeEventListener('mouseleave', onContainerLeave);
                });
            } else {
                const onPinEnter = () => activateLabel();

                const onPinLeave = (e: MouseEvent) => {
                    const relatedTarget = e.relatedTarget as Element;
                    if (relatedTarget && relatedTarget === labelEl) {
                        return;
                    }
                    deactivateLabel();
                };

                const onLabelEnter = () => activateLabel();

                const onLabelLeave = (e: MouseEvent) => {
                    const relatedTarget = e.relatedTarget as Element;
                    if (relatedTarget && relatedTarget === pinEl) {
                        return;
                    }
                    deactivateLabel();
                };

                pinEl.addEventListener('mouseenter', onPinEnter);
                pinEl.addEventListener('mouseleave', onPinLeave);
                labelEl.addEventListener('mouseenter', onLabelEnter);
                labelEl.addEventListener('mouseleave', onLabelLeave);

                cleanups.push(() => {
                    pinEl.removeEventListener('mouseenter', onPinEnter);
                    pinEl.removeEventListener('mouseleave', onPinLeave);
                    labelEl.removeEventListener('mouseenter', onLabelEnter);
                    labelEl.removeEventListener('mouseleave', onLabelLeave);
                });
            }
        });

        return () => {
            cleanups.forEach(cleanup => cleanup());
        };
    }, []);

    const handleMouseMove = (e: React.MouseEvent) => {
        mousePosRef.current = { x: e.clientX, y: e.clientY };

        if (!isDragging) return;

        const newX = e.clientX - startPos.x;
        const newY = e.clientY - startPos.y;
        setPosition(prev => ({ ...prev, x: newX, y: newY }));
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        setStartPos({
            x: e.clientX - position.x,
            y: e.clientY - position.y,
        });
    };

    const handleMouseUp = () => setIsDragging(false);

    const handleTouchStart = (e: React.TouchEvent) => {
        const touch = e.touches[0];
        mousePosRef.current = { x: touch.clientX, y: touch.clientY };
        setIsDragging(true);
        setStartPos({
            x: touch.clientX - position.x,
            y: touch.clientY - position.y,
        });
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        const touch = e.touches[0];
        mousePosRef.current = { x: touch.clientX, y: touch.clientY };

        if (!isDragging) return;

        const newX = touch.clientX - startPos.x;
        const newY = touch.clientY - startPos.y;
        setPosition(prev => ({ ...prev, x: newX, y: newY }));
    };

    const handleTouchEnd = () => setIsDragging(false);

    return (
        <div
            ref={containerRef}
            className="map-container"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={{
                width: '100%',
                height: '100%',
                backgroundColor: 'var(--background-base)',
                overflow: 'hidden',
                cursor: isDragging ? 'grabbing' : 'grab',
                touchAction: 'none',
            }}
        >
            <MapaSvg
                ref={svgRef}
                style={{
                    transform: `translate(${position.x}px, ${position.y}px)`,
                    transition: isDragging ? 'none' : 'transform 0.08s ease-out',
                    userSelect: 'none',
                    width: `${mapSize}%`,
                    height: `${mapSize}%`,
                    transformOrigin: 'top left',
                    display: 'block',
                }}
            />
        </div>
    );
};

export default Map;
