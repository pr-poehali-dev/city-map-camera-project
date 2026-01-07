import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

import CityMap from '@/components/CityMap';

interface Camera {
  id: string;
  name: string;
  lat: number;
  lng: number;
  radius: number;
  status: 'active' | 'inactive' | 'warning';
  coverage: number;
  lastActivity: string;
}

const Index = () => {
  const [cameras, setCameras] = useState<Camera[]>([
    { id: '1', name: 'Камера ул. Карла Маркса', lat: 52.2897, lng: 104.2806, radius: 150, status: 'active', coverage: 85, lastActivity: '2 мин назад' },
    { id: '2', name: 'Камера площадь Кирова', lat: 52.2856, lng: 104.2896, radius: 120, status: 'active', coverage: 92, lastActivity: '5 мин назад' },
    { id: '3', name: 'Камера набережная Ангары', lat: 52.2950, lng: 104.2750, radius: 100, status: 'warning', coverage: 67, lastActivity: '15 мин назад' },
  ]);
  
  const [selectedCamera, setSelectedCamera] = useState<Camera | null>(null);
  const [isAddingCamera, setIsAddingCamera] = useState(false);
  const [newCamera, setNewCamera] = useState({ name: '', lat: 52.2897, lng: 104.2806, radius: 100 });

  const handleMapClick = (lat: number, lng: number) => {
    if (!isAddingCamera) return;
    setNewCamera({ ...newCamera, lat, lng });
  };

  const addCamera = () => {
    if (!newCamera.name) return;
    
    const camera: Camera = {
      id: Date.now().toString(),
      name: newCamera.name,
      lat: newCamera.lat,
      lng: newCamera.lng,
      radius: newCamera.radius,
      status: 'active',
      coverage: Math.floor(Math.random() * 30) + 70,
      lastActivity: 'только что'
    };
    
    setCameras([...cameras, camera]);
    setNewCamera({ name: '', lat: 52.2897, lng: 104.2806, radius: 100 });
    setIsAddingCamera(false);
  };

  const deleteCamera = (id: string) => {
    setCameras(cameras.filter(cam => cam.id !== id));
    if (selectedCamera?.id === id) setSelectedCamera(null);
  };

  const totalCoverage = cameras.length > 0 
    ? Math.round(cameras.reduce((acc, cam) => acc + cam.coverage, 0) / cameras.length) 
    : 0;
  
  const activeCameras = cameras.filter(cam => cam.status === 'active').length;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Icon name="Camera" className="text-primary-foreground" size={24} />
              </div>
              <div>
                <h1 className="text-xl font-bold">Система видеонаблюдения</h1>
                <p className="text-sm text-muted-foreground">Мониторинг городской инфраструктуры</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-2 bg-muted rounded-lg">
                <Icon name="Activity" size={16} className="text-primary" />
                <span className="text-sm font-medium">{activeCameras} / {cameras.length} активны</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Карта города</h2>
                <Button 
                  onClick={() => setIsAddingCamera(!isAddingCamera)}
                  variant={isAddingCamera ? "default" : "outline"}
                  size="sm"
                >
                  <Icon name={isAddingCamera ? "X" : "Plus"} size={16} className="mr-2" />
                  {isAddingCamera ? 'Отменить' : 'Добавить камеру'}
                </Button>
              </div>
              
              <CityMap
                cameras={cameras}
                onCameraClick={(camera) => setSelectedCamera(camera)}
                onMapClick={handleMapClick}
                isAddingCamera={isAddingCamera}
                newCameraPosition={isAddingCamera ? { lat: newCamera.lat, lng: newCamera.lng } : undefined}
              />

              {isAddingCamera && (
                <Card className="mt-4 p-4 bg-muted/50">
                  <h3 className="font-medium mb-3">Настройка новой камеры</h3>
                  <div className="grid gap-4">
                    <div>
                      <Label htmlFor="camera-name">Название камеры</Label>
                      <Input
                        id="camera-name"
                        placeholder="Например: Камера-4"
                        value={newCamera.name}
                        onChange={(e) => setNewCamera({ ...newCamera, name: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Радиус обзора: {newCamera.radius}м</Label>
                      <Slider
                        value={[newCamera.radius]}
                        onValueChange={(value) => setNewCamera({ ...newCamera, radius: value[0] })}
                        min={50}
                        max={250}
                        step={10}
                        className="mt-2"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={addCamera} className="flex-1" disabled={!newCamera.name}>
                        <Icon name="Check" size={16} className="mr-2" />
                        Добавить
                      </Button>
                      <Button onClick={() => setIsAddingCamera(false)} variant="outline">
                        Отмена
                      </Button>
                    </div>
                  </div>
                </Card>
              )}
            </Card>

            <div className="grid grid-cols-3 gap-4 mt-6">
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Icon name="Camera" size={24} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{cameras.length}</p>
                    <p className="text-sm text-muted-foreground">Всего камер</p>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
                    <Icon name="CheckCircle" size={24} className="text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{activeCameras}</p>
                    <p className="text-sm text-muted-foreground">Активны</p>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Icon name="Target" size={24} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{totalCoverage}%</p>
                    <p className="text-sm text-muted-foreground">Покрытие</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          <div>
            <Tabs defaultValue="cameras" className="w-full">
              <TabsList className="w-full">
                <TabsTrigger value="cameras" className="flex-1">
                  <Icon name="List" size={16} className="mr-2" />
                  Камеры
                </TabsTrigger>
                <TabsTrigger value="stats" className="flex-1">
                  <Icon name="BarChart3" size={16} className="mr-2" />
                  Статистика
                </TabsTrigger>
              </TabsList>

              <TabsContent value="cameras" className="mt-4">
                <Card className="p-4">
                  <ScrollArea className="h-[600px] pr-4">
                    <div className="space-y-3">
                      {cameras.map((camera) => (
                        <Card 
                          key={camera.id} 
                          className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                            selectedCamera?.id === camera.id ? 'ring-2 ring-primary' : ''
                          }`}
                          onClick={() => setSelectedCamera(camera)}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                                <Icon name="Video" size={20} className="text-primary" />
                              </div>
                              <div>
                                <h3 className="font-semibold">{camera.name}</h3>
                                <p className="text-xs text-muted-foreground">{camera.lastActivity}</p>
                              </div>
                            </div>
                            <Badge variant={camera.status === 'active' ? 'default' : 'secondary'}>
                              {camera.status === 'active' ? 'Активна' : camera.status === 'warning' ? 'Внимание' : 'Неактивна'}
                            </Badge>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Покрытие</span>
                              <span className="font-medium">{camera.coverage}%</span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2">
                              <div 
                                className="bg-primary rounded-full h-2 transition-all" 
                                style={{ width: `${camera.coverage}%` }}
                              />
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Радиус</span>
                              <span className="font-medium">{camera.radius}м</span>
                            </div>
                          </div>

                          <div className="flex gap-2 mt-3">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm" className="flex-1">
                                  <Icon name="Settings" size={14} className="mr-1" />
                                  Настроить
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Настройки {camera.name}</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                  <div>
                                    <Label>Название</Label>
                                    <Input defaultValue={camera.name} className="mt-1" />
                                  </div>
                                  <div>
                                    <Label>Радиус обзора: {camera.radius}м</Label>
                                    <Slider
                                      defaultValue={[camera.radius]}
                                      min={50}
                                      max={250}
                                      step={10}
                                      className="mt-2"
                                    />
                                  </div>
                                  <Button className="w-full">
                                    Сохранить изменения
                                  </Button>
                                </div>
                              </DialogContent>
                            </Dialog>
                            
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteCamera(camera.id);
                              }}
                            >
                              <Icon name="Trash2" size={14} />
                            </Button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                </Card>
              </TabsContent>

              <TabsContent value="stats" className="mt-4">
                <Card className="p-4">
                  <h3 className="font-semibold mb-4">Отчеты и аналитика</h3>
                  <div className="space-y-4">
                    <div className="p-4 bg-muted rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Активность за сегодня</span>
                        <Icon name="TrendingUp" size={16} className="text-green-600" />
                      </div>
                      <p className="text-2xl font-bold">247 событий</p>
                      <p className="text-xs text-muted-foreground mt-1">+18% к вчерашнему дню</p>
                    </div>

                    <div className="p-4 bg-muted rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Среднее покрытие</span>
                        <Icon name="Target" size={16} className="text-primary" />
                      </div>
                      <p className="text-2xl font-bold">{totalCoverage}%</p>
                      <p className="text-xs text-muted-foreground mt-1">В пределах нормы</p>
                    </div>

                    <div className="p-4 bg-muted rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Время работы системы</span>
                        <Icon name="Clock" size={16} className="text-primary" />
                      </div>
                      <p className="text-2xl font-bold">99.8%</p>
                      <p className="text-xs text-muted-foreground mt-1">Последние 30 дней</p>
                    </div>

                    <div className="p-4 bg-muted rounded-lg">
                      <h4 className="text-sm font-medium mb-3">Последние события</h4>
                      <div className="space-y-2">
                        {[
                          { time: '10:24', text: 'Камера-2 обнаружила движение', type: 'info' },
                          { time: '09:15', text: 'Камера-3 требует обслуживания', type: 'warning' },
                          { time: '08:45', text: 'Система обновлена до v2.1', type: 'success' },
                        ].map((event, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-sm">
                            <div className={`w-2 h-2 rounded-full mt-1.5 ${
                              event.type === 'success' ? 'bg-green-500' : 
                              event.type === 'warning' ? 'bg-orange-500' : 'bg-primary'
                            }`} />
                            <div className="flex-1">
                              <p className="text-xs text-muted-foreground">{event.time}</p>
                              <p>{event.text}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;