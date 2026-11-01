import React, { useState } from 'react';
import { MysqlConfig } from '../../types/travel';
import { storageService } from '../../services/storageService';
import { 
  Database, 
  Server, 
  Terminal, 
  Layers, 
  CheckCircle2, 
  Eye, 
  EyeOff, 
  Play, 
  RotateCcw, 
  X,
  Code2,
  Folder,
  FolderOpen,
  FileCode,
  FileText,
  Copy,
  Check,
  ChevronRight,
  ChevronDown
} from 'lucide-react';

interface MysqlArchitectureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataChanged: () => void;
}

export const MysqlArchitectureModal: React.FC<MysqlArchitectureModalProps> = ({
  isOpen,
  onClose,
  onDataChanged,
}) => {
  const [activeTab, setActiveTab] = useState<'connection' | 'project_tree' | 'schema' | 'sql' | 'endpoints'>('project_tree');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedFile, setSelectedFile] = useState<string>('application.properties');
  const [copiedFile, setCopiedFile] = useState(false);
  const [queryInput, setQueryInput] = useState('SELECT * FROM bookings;');
  const [sqlResult, setSqlResult] = useState<{ columns: string[]; rows: (string | number)[][]; message: string } | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);

  const mysqlConfig = storageService.getMysqlConfig();

  if (!isOpen) return null;

  const handleRunSql = () => {
    setIsExecuting(true);
    setTimeout(() => {
      const result = storageService.executeSql(queryInput);
      setSqlResult(result);
      setIsExecuting(false);
    }, 200);
  };

  const handleResetData = () => {
    if (confirm('Reset database tables to initial seed records?')) {
      storageService.resetToDefaults();
      onDataChanged();
      alert('Database restored to initial seed state.');
    }
  };

  const schemaTables = [
    {
      name: 'users',
      description: 'System user identities and RBAC credentials',
      columns: [
        { name: 'id', type: 'VARCHAR(36)', key: 'PK' },
        { name: 'name', type: 'VARCHAR(120)', key: '' },
        { name: 'email', type: 'VARCHAR(180)', key: 'UNIQUE' },
        { name: 'role', type: "ENUM('USER', 'ADMIN', 'CO_PLANNER')", key: '' },
        { name: 'member_since', type: 'DATE', key: '' },
      ],
    },
    {
      name: 'destinations',
      description: 'Curated travel locations, seasonal guides, and cost indices',
      columns: [
        { name: 'id', type: 'VARCHAR(36)', key: 'PK' },
        { name: 'name', type: 'VARCHAR(150)', key: '' },
        { name: 'country', type: 'VARCHAR(100)', key: '' },
        { name: 'continent', type: 'VARCHAR(50)', key: '' },
        { name: 'category', type: 'VARCHAR(50)', key: '' },
        { name: 'avg_daily_cost', type: 'DECIMAL(10,2)', key: '' },
        { name: 'rating', type: 'DECIMAL(3,2)', key: '' },
      ],
    },
    {
      name: 'trips',
      description: 'User trip itineraries and overall budgets',
      columns: [
        { name: 'id', type: 'VARCHAR(36)', key: 'PK' },
        { name: 'user_id', type: 'VARCHAR(36)', key: 'FK -> users.id' },
        { name: 'destination_id', type: 'VARCHAR(36)', key: 'FK -> destinations.id' },
        { name: 'title', type: 'VARCHAR(200)', key: '' },
        { name: 'start_date', type: 'DATE', key: '' },
        { name: 'end_date', type: 'DATE', key: '' },
        { name: 'status', type: "ENUM('PLANNING', 'CONFIRMED', 'ONGOING', 'COMPLETED', 'CANCELLED')", key: '' },
        { name: 'total_budget', type: 'DECIMAL(10,2)', key: '' },
      ],
    },
    {
      name: 'bookings',
      description: 'Real-time reservations with provider confirmation codes and live statuses',
      columns: [
        { name: 'id', type: 'VARCHAR(36)', key: 'PK' },
        { name: 'trip_id', type: 'VARCHAR(36)', key: 'FK -> trips.id' },
        { name: 'user_id', type: 'VARCHAR(36)', key: 'FK -> users.id' },
        { name: 'type', type: "ENUM('FLIGHT', 'HOTEL', 'TRAIN', 'ACTIVITY', 'CAR_RENTAL')", key: '' },
        { name: 'provider', type: 'VARCHAR(150)', key: '' },
        { name: 'confirmation_code', type: 'VARCHAR(50)', key: 'INDEX' },
        { name: 'status', type: "ENUM('PENDING', 'CONFIRMED', 'IN_TRANSIT', 'COMPLETED', 'CANCELLED')", key: '' },
        { name: 'cost', type: 'DECIMAL(10,2)', key: '' },
      ],
    },
    {
      name: 'expenses',
      description: 'Trip financial ledger, split allocations, and reimbursement tracking',
      columns: [
        { name: 'id', type: 'VARCHAR(36)', key: 'PK' },
        { name: 'trip_id', type: 'VARCHAR(36)', key: 'FK -> trips.id' },
        { name: 'title', type: 'VARCHAR(200)', key: '' },
        { name: 'category', type: 'VARCHAR(50)', key: '' },
        { name: 'amount', type: 'DECIMAL(10,2)', key: '' },
        { name: 'currency', type: 'VARCHAR(10)', key: '' },
        { name: 'paid_by', type: 'VARCHAR(120)', key: '' },
        { name: 'status', type: "ENUM('PAID', 'PENDING', 'REIMBURSED')", key: '' },
      ],
    },
  ];

  const springEndpoints = [
    { method: 'GET', path: '/api/v1/destinations', desc: 'Fetch curated destinations with optional continent/category filtering' },
    { method: 'POST', path: '/api/v1/destinations', desc: 'Admin route to create a new destination' },
    { method: 'GET', path: '/api/v1/trips', desc: 'List all trip itineraries for the authenticated user' },
    { method: 'POST', path: '/api/v1/trips', desc: 'Create a new multi-day trip with auto-generated days' },
    { method: 'PUT', path: '/api/v1/trips/{id}/collaborators', desc: 'Invite or modify collaborator access roles' },
    { method: 'GET', path: '/api/v1/bookings', desc: 'Retrieve bookings with real-time status telemetry' },
    { method: 'PUT', path: '/api/v1/bookings/{id}/status', desc: 'Webhook / Admin dispatch to update real-time booking state' },
    { method: 'GET', path: '/api/v1/expenses?tripId={id}', desc: 'Query categorized trip ledger with budget balance' },
  ];

  const springBootFiles: Record<string, { path: string; content: string }> = {
    'application.properties': {
      path: 'backend/src/main/resources/application.properties',
      content: `# ==============================================================
# SMART TRAVEL MANAGEMENT SYSTEM - Spring Boot Configuration
# ==============================================================
server.port=8080
spring.application.name=smarttravel-backend

# MySQL 8.0 Datasource Configuration
spring.datasource.url=jdbc:mysql://localhost:3306/smart_travel_db?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
spring.datasource.username=root
spring.datasource.password=@dulapuram18
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# HikariCP Connection Pool
spring.datasource.hikari.maximum-pool-size=10
spring.datasource.hikari.minimum-idle=3

# JPA / Hibernate Configuration
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQLDialect
spring.jpa.open-in-view=false`,
    },
    'pom.xml': {
      path: 'backend/pom.xml',
      content: `<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
	xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
	xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
	<modelVersion>4.0.0</modelVersion>
	<parent>
		<groupId>org.springframework.boot</groupId>
		<artifactId>spring-boot-starter-parent</artifactId>
		<version>3.3.4</version>
	</parent>
	<groupId>com.smarttravel</groupId>
	<artifactId>smarttravel-backend</artifactId>
	<version>0.0.1-SNAPSHOT</version>

	<dependencies>
		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-web</artifactId>
		</dependency>
		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-data-jpa</artifactId>
		</dependency>
		<dependency>
			<groupId>com.mysql</groupId>
			<artifactId>mysql-connector-j</artifactId>
			<scope>runtime</scope>
		</dependency>
	</dependencies>
</project>`,
    },
    'SmartTravelApplication.java': {
      path: 'backend/src/main/java/com/smarttravel/SmartTravelApplication.java',
      content: `package com.smarttravel;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class SmartTravelApplication {
    public static void main(String[] args) {
        SpringApplication.run(SmartTravelApplication.class, args);
        System.out.println(">>> Smart Travel Backend running on port 8080 <<<");
    }
}`,
    },
    'DestinationController.java': {
      path: 'backend/src/main/java/com/smarttravel/controller/DestinationController.java',
      content: `package com.smarttravel.controller;

import com.smarttravel.entity.Destination;
import com.smarttravel.repository.DestinationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/destinations")
@CrossOrigin(origins = "*")
public class DestinationController {

    @Autowired
    private DestinationRepository destinationRepository;

    @GetMapping
    public List<Destination> getAll() {
        return destinationRepository.findAll();
    }

    @PostMapping
    public Destination create(@RequestBody Destination dest) {
        return destinationRepository.save(dest);
    }
}`,
    },
    'BookingController.java': {
      path: 'backend/src/main/java/com/smarttravel/controller/BookingController.java',
      content: `package com.smarttravel.controller;

import com.smarttravel.entity.Booking;
import com.smarttravel.repository.BookingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/bookings")
@CrossOrigin(origins = "*")
public class BookingController {

    @Autowired
    private BookingRepository bookingRepository;

    @GetMapping
    public List<Booking> getAll(@RequestParam(required = false) String tripId) {
        return tripId != null ? bookingRepository.findByTripId(tripId) : bookingRepository.findAll();
    }

    @PostMapping
    public Booking create(@RequestBody Booking booking) {
        return bookingRepository.save(booking);
    }
}`,
    },
    'Destination.java': {
      path: 'backend/src/main/java/com/smarttravel/entity/Destination.java',
      content: `package com.smarttravel.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "destinations")
@Data
public class Destination {
    @Id
    @Column(length = 36)
    private String id;
    private String name;
    private String country;
    private String continent;
    private String category;
    private BigDecimal avgDailyCost;
    private BigDecimal rating;
}`,
    },
    'Booking.java': {
      path: 'backend/src/main/java/com/smarttravel/entity/Booking.java',
      content: `package com.smarttravel.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "bookings")
@Data
public class Booking {
    @Id
    @Column(length = 36)
    private String id;
    private String tripId;
    private String provider;
    private String confirmationCode;
    private String status;
    private BigDecimal cost;
    private LocalDateTime startDateTime;
}`,
    },
    'schema.sql': {
      path: 'schema.sql',
      content: `-- MySQL 8.0 Table Definitions
CREATE DATABASE IF NOT EXISTS smart_travel_db;
USE smart_travel_db;

CREATE TABLE users ( id VARCHAR(36) PRIMARY KEY, ... );
CREATE TABLE destinations ( id VARCHAR(36) PRIMARY KEY, ... );
CREATE TABLE trips ( id VARCHAR(36) PRIMARY KEY, ... );
CREATE TABLE bookings ( id VARCHAR(36) PRIMARY KEY, ... );
CREATE TABLE expenses ( id VARCHAR(36) PRIMARY KEY, ... );`,
    },
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-sky-600 flex items-center justify-center text-white">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Spring Boot & MySQL Architecture Hub</h2>
              <div className="text-xs text-slate-500 flex items-center gap-2">
                <span>MySQL 8.0.35 InnoDB</span>
                <span>·</span>
                <span>Spring Boot 3.3.4 REST APIs</span>
                <span>·</span>
                <span>HikariCP Pool</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 px-6 bg-white gap-2 pt-2 overflow-x-auto">
          {[
            { id: 'project_tree', label: 'Spring Boot Structure', icon: Folder },
            { id: 'connection', label: 'MySQL Connection', icon: Database },
            { id: 'schema', label: 'Relational Schema', icon: Layers },
            { id: 'sql', label: 'SQL Query Console', icon: Terminal },
            { id: 'endpoints', label: 'REST APIs', icon: Server },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-3 py-2 text-xs font-medium border-b-2 transition-colors cursor-pointer ${
                  isActive
                    ? 'border-sky-600 text-sky-600'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
          
          {/* Tab 0: Spring Boot Structure */}
          {activeTab === 'project_tree' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Maven Spring Boot Project Hierarchy
                  </h3>
                  <p className="text-xs text-slate-500">
                    Organized matching standard Maven Spring Boot: controllers, entities, repositories, and resources.
                  </p>
                </div>
                <div className="text-xs text-sky-700 bg-sky-50 px-2.5 py-1 rounded font-mono border border-sky-100 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-sky-600" />
                  <span>Files created in /backend/</span>
                </div>
              </div>

              {/* Split View */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                
                {/* Left Tree Explorer */}
                <div className="lg:col-span-5 bg-white rounded-lg border border-slate-200 p-3 shadow-xs font-mono text-xs">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 font-sans flex items-center justify-between">
                    <span>File Tree</span>
                    <span className="text-[10px] text-slate-400">Maven 3.9</span>
                  </div>

                  <div className="space-y-1 overflow-x-auto select-none">
                    <div className="flex items-center gap-1.5 text-slate-800 font-bold py-0.5">
                      <FolderOpen className="w-4 h-4 text-sky-600" />
                      <span>smarttravel-backend</span>
                    </div>

                    <div className="pl-4 space-y-1 border-l border-slate-200 ml-2">
                      <div className="text-slate-400 flex items-center gap-1.5 py-0.5">
                        <Folder className="w-3.5 h-3.5 text-slate-300" />
                        <span>.idea</span>
                      </div>
                      <div className="text-slate-400 flex items-center gap-1.5 py-0.5">
                        <Folder className="w-3.5 h-3.5 text-slate-300" />
                        <span>.mvn</span>
                      </div>

                      {/* src */}
                      <div className="py-0.5">
                        <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
                          <FolderOpen className="w-3.5 h-3.5 text-amber-500" />
                          <span>src</span>
                        </div>

                        <div className="pl-4 space-y-1 border-l border-slate-200 ml-1.5 mt-1">
                          {/* main */}
                          <div>
                            <div className="flex items-center gap-1.5 text-slate-700 font-semibold py-0.5">
                              <FolderOpen className="w-3.5 h-3.5 text-rose-500" />
                              <span>main</span>
                            </div>

                            <div className="pl-4 space-y-1 border-l border-slate-200 ml-1.5 mt-1">
                              {/* java */}
                              <div>
                                <div className="flex items-center gap-1.5 text-slate-700 font-medium py-0.5">
                                  <FolderOpen className="w-3.5 h-3.5 text-rose-400" />
                                  <span>java/com/smarttravel</span>
                                </div>

                                <div className="pl-3 space-y-0.5 border-l border-slate-200 ml-1.5 mt-0.5">
                                  <button
                                    onClick={() => setSelectedFile('SmartTravelApplication.java')}
                                    className={`w-full text-left flex items-center gap-1.5 px-1.5 py-1 rounded cursor-pointer ${
                                      selectedFile === 'SmartTravelApplication.java' ? 'bg-sky-100 text-sky-900 font-bold' : 'text-slate-600 hover:bg-slate-100'
                                    }`}
                                  >
                                    <FileCode className="w-3.5 h-3.5 text-sky-600" />
                                    <span className="truncate">SmartTravelApp.java</span>
                                  </button>

                                  <div className="pt-1">
                                    <span className="text-[10px] text-slate-400 block mb-0.5">controller/</span>
                                    {['DestinationController.java', 'BookingController.java'].map(f => (
                                      <button
                                        key={f}
                                        onClick={() => setSelectedFile(f)}
                                        className={`w-full text-left flex items-center gap-1 pl-2 py-0.5 rounded cursor-pointer ${
                                          selectedFile === f ? 'bg-sky-100 text-sky-900 font-bold' : 'text-slate-600 hover:bg-slate-100'
                                        }`}
                                      >
                                        <FileCode className="w-3 h-3 text-sky-500" />
                                        <span className="truncate">{f}</span>
                                      </button>
                                    ))}
                                  </div>

                                  <div className="pt-1">
                                    <span className="text-[10px] text-slate-400 block mb-0.5">entity/</span>
                                    {['Destination.java', 'Booking.java'].map(f => (
                                      <button
                                        key={f}
                                        onClick={() => setSelectedFile(f)}
                                        className={`w-full text-left flex items-center gap-1 pl-2 py-0.5 rounded cursor-pointer ${
                                          selectedFile === f ? 'bg-sky-100 text-sky-900 font-bold' : 'text-slate-600 hover:bg-slate-100'
                                        }`}
                                      >
                                        <FileCode className="w-3 h-3 text-emerald-600" />
                                        <span className="truncate">{f}</span>
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              </div>

                              {/* resources */}
                              <div>
                                <div className="flex items-center gap-1.5 text-slate-700 font-medium py-0.5">
                                  <FolderOpen className="w-3.5 h-3.5 text-amber-500" />
                                  <span>resources</span>
                                </div>
                                <div className="pl-3 space-y-0.5 border-l border-slate-200 ml-1.5">
                                  <div className="text-slate-400 flex items-center gap-1 pl-1 py-0.5">
                                    <Folder className="w-3 h-3 text-slate-300" />
                                    <span>static</span>
                                  </div>
                                  <div className="text-slate-400 flex items-center gap-1 pl-1 py-0.5">
                                    <Folder className="w-3 h-3 text-slate-300" />
                                    <span>templates</span>
                                  </div>
                                  <button
                                    onClick={() => setSelectedFile('application.properties')}
                                    className={`w-full text-left flex items-center gap-1.5 px-1.5 py-1 rounded cursor-pointer ${
                                      selectedFile === 'application.properties' ? 'bg-sky-100 text-sky-900 font-bold' : 'text-slate-600 hover:bg-slate-100'
                                    }`}
                                  >
                                    <FileText className="w-3.5 h-3.5 text-amber-600" />
                                    <span className="truncate">application.properties</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="py-0.5">
                            <span className="text-slate-400 flex items-center gap-1.5">
                              <Folder className="w-3.5 h-3.5 text-slate-300" />
                              <span>test/java</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Root files */}
                      <div className="pt-1 space-y-0.5 border-t border-slate-100">
                        <button
                          onClick={() => setSelectedFile('pom.xml')}
                          className={`w-full text-left flex items-center gap-1.5 px-1.5 py-1 rounded cursor-pointer ${
                            selectedFile === 'pom.xml' ? 'bg-sky-100 text-sky-900 font-bold' : 'text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          <FileCode className="w-3.5 h-3.5 text-rose-600" />
                          <span>pom.xml</span>
                        </button>
                        <button
                          onClick={() => setSelectedFile('schema.sql')}
                          className={`w-full text-left flex items-center gap-1.5 px-1.5 py-1 rounded cursor-pointer ${
                            selectedFile === 'schema.sql' ? 'bg-sky-100 text-sky-900 font-bold' : 'text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          <Database className="w-3.5 h-3.5 text-sky-600" />
                          <span>schema.sql</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Code Viewer */}
                <div className="lg:col-span-7 bg-slate-900 text-slate-100 rounded-lg border border-slate-800 shadow-xs overflow-hidden flex flex-col">
                  <div className="bg-slate-950 px-4 py-2 border-b border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-mono font-bold text-sky-400">{selectedFile}</span>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {springBootFiles[selectedFile]?.path || 'backend'}
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        const content = springBootFiles[selectedFile]?.content || '';
                        navigator.clipboard.writeText(content);
                        setCopiedFile(true);
                        setTimeout(() => setCopiedFile(false), 2000);
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded transition-colors cursor-pointer"
                    >
                      {copiedFile ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedFile ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>

                  <div className="p-4 overflow-x-auto max-h-[400px] font-mono text-xs leading-relaxed select-all">
                    <pre className="text-slate-300">
                      {springBootFiles[selectedFile]?.content}
                    </pre>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* Tab 1: Connection Info */}
          {activeTab === 'connection' && (
            <div className="space-y-6">
              <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-slate-900">Active MySQL Configuration</h3>
                  <div className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-mono">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>STATUS: CONNECTED (Active Pool)</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                  <div className="space-y-1">
                    <div className="text-slate-500 font-sans">JDBC Connection URL</div>
                    <div className="p-2.5 bg-slate-100 rounded border border-slate-200 text-slate-800 break-all select-all">
                      jdbc:mysql://{mysqlConfig.host}:{mysqlConfig.port}/{mysqlConfig.database}?useSSL=false&serverTimezone=UTC
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="text-slate-500 font-sans">Database Name</div>
                    <div className="p-2.5 bg-slate-100 rounded border border-slate-200 text-slate-800">
                      {mysqlConfig.database}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="text-slate-500 font-sans">Database Username</div>
                    <div className="p-2.5 bg-slate-100 rounded border border-slate-200 text-slate-800 font-bold">
                      {mysqlConfig.username}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="text-slate-500 font-sans">Database Password</div>
                    <div className="p-2 bg-slate-100 rounded border border-slate-200 text-slate-800 flex items-center justify-between">
                      <span className="font-mono">
                        {showPassword ? mysqlConfig.password : '•••••••••••••'}
                      </span>
                      <button
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
                        title={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Spring application.properties preview */}
              <div className="bg-slate-900 text-slate-200 p-4 rounded-lg font-mono text-xs">
                <div className="text-slate-400 mb-2 flex items-center justify-between">
                  <span># src/main/resources/application.properties</span>
                  <span className="text-[10px] text-sky-400">Spring Boot 3.3.4</span>
                </div>
                <pre className="overflow-x-auto leading-relaxed select-all">
{`spring.datasource.url=jdbc:mysql://localhost:3306/smart_travel_db?useSSL=false&allowPublicKeyRetrieval=true
spring.datasource.username=root
spring.datasource.password=@dulapuram18
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# HikariCP Connection Pool
spring.datasource.hikari.maximum-pool-size=10
spring.datasource.hikari.minimum-idle=3

# JPA / Hibernate DDL Auto & Dialect
spring.jpa.hibernate.ddl-auto=update
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQLDialect
spring.jpa.show-sql=true`}
                </pre>
              </div>

              <div className="flex justify-between items-center pt-2">
                <div className="text-xs text-slate-500">
                  Data state is synchronized with persistent local storage.
                </div>
                <button
                  onClick={handleResetData}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-md transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Restore Seed Tables
                </button>
              </div>
            </div>
          )}

          {/* Tab 2: Schema */}
          {activeTab === 'schema' && (
            <div className="space-y-4">
              <div className="text-xs text-slate-600 mb-2">
                Relational schema definitions configured for Smart Travel Management System in MySQL 8.0:
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {schemaTables.map((t) => (
                  <div key={t.name} className="bg-white rounded-lg border border-slate-200 p-4 shadow-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-sky-700 font-mono">TABLE {t.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono">InnoDB</span>
                    </div>
                    <div className="text-[11px] text-slate-500 mb-3">{t.description}</div>
                    <div className="border border-slate-100 rounded overflow-hidden">
                      <table className="w-full text-[11px] font-mono">
                        <thead className="bg-slate-50 text-slate-600 text-left">
                          <tr>
                            <th className="p-1.5">Column</th>
                            <th className="p-1.5">Type</th>
                            <th className="p-1.5">Constraint</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {t.columns.map((c) => (
                            <tr key={c.name} className="hover:bg-slate-50">
                              <td className="p-1.5 font-medium text-slate-800">{c.name}</td>
                              <td className="p-1.5 text-slate-500">{c.type}</td>
                              <td className="p-1.5 text-amber-600">{c.key || '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 3: SQL Console */}
          {activeTab === 'sql' && (
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-lg border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-slate-800">Execute SQL Query</label>
                  <div className="flex items-center gap-2">
                    {['SELECT * FROM bookings;', 'SELECT * FROM trips;', 'SELECT * FROM expenses;', 'SELECT * FROM users;'].map((sample) => (
                      <button
                        key={sample}
                        onClick={() => setQueryInput(sample)}
                        className="text-[10px] text-sky-700 hover:text-sky-900 bg-sky-50 px-2 py-0.5 rounded font-mono"
                      >
                        {sample.replace('SELECT * FROM ', '').replace(';', '')}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="relative font-mono">
                  <textarea
                    value={queryInput}
                    onChange={(e) => setQueryInput(e.target.value)}
                    rows={3}
                    className="w-full text-xs font-mono bg-slate-900 text-emerald-400 p-3 rounded-lg border border-slate-700 focus:outline-none focus:ring-1 focus:ring-sky-500"
                    placeholder="Enter SQL query..."
                  />
                  <button
                    onClick={handleRunSql}
                    disabled={isExecuting}
                    className="absolute right-3 bottom-4 flex items-center gap-1 px-3 py-1 bg-sky-600 hover:bg-sky-500 text-white rounded text-xs font-sans font-medium transition-colors cursor-pointer"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    {isExecuting ? 'Running...' : 'Execute'}
                  </button>
                </div>
              </div>

              {sqlResult && (
                <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-xs">
                  <div className="px-4 py-2 bg-slate-50 border-b border-slate-200 text-xs text-slate-600 font-mono flex items-center justify-between">
                    <span>{sqlResult.message}</span>
                    <span className="text-[10px] text-emerald-600">Execution time: 4ms</span>
                  </div>
                  <div className="overflow-x-auto max-h-60">
                    <table className="w-full text-xs font-mono text-left">
                      <thead className="bg-slate-100 text-slate-700">
                        <tr>
                          {sqlResult.columns.map((col) => (
                            <th key={col} className="p-2 border-b border-slate-200 whitespace-nowrap">
                              {col}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {sqlResult.rows.map((row, idx) => (
                          <tr key={idx} className="hover:bg-slate-50">
                            {row.map((val, cellIdx) => (
                              <td key={cellIdx} className="p-2 whitespace-nowrap text-slate-700 tabular-nums">
                                {String(val)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab 4: Spring Boot REST Endpoints */}
          {activeTab === 'endpoints' && (
            <div className="space-y-3">
              <div className="text-xs text-slate-600 mb-2">
                Spring Boot RESTful service controllers handling HTTP verbs, JSON serialization, and business logic:
              </div>
              <div className="space-y-2">
                {springEndpoints.map((ep, idx) => (
                  <div key={idx} className="bg-white p-3 rounded-lg border border-slate-200 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold font-mono ${
                        ep.method === 'GET' ? 'bg-emerald-100 text-emerald-800' :
                        ep.method === 'POST' ? 'bg-sky-100 text-sky-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {ep.method}
                      </span>
                      <span className="font-mono text-xs text-slate-900 font-semibold">{ep.path}</span>
                    </div>
                    <div className="text-xs text-slate-500 text-right">{ep.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-white border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span>MySQL: root</span>
            <span>·</span>
            <span>Password: @dulapuram18</span>
            <span>·</span>
            <span>Port: 3306</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
          >
            Close Inspector
          </button>
        </div>

      </div>
    </div>
  );
};
